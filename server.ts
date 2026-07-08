import express from "express";
import path from "path";
import fs from "fs";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import { randomUUID } from "crypto";
import swaggerUi from "swagger-ui-express";
import { swaggerDocument } from "./server/swaggerSpec";
import { metricsService } from "./server/services/metricsService";

// Validate essential environment variables immediately on startup using Zod
import { env } from "./server/config/env";

// Import modular API router
import architectureRouter from "./server/routes/architectureRoutes";
import { logger, correlationIdMiddleware } from "./server/middlewares/security";
import { cacheService } from "./server/services/cacheService";

const PORT = env.PORT;
const NODE_ENV = env.NODE_ENV;

logger.info(
  `Validating environment: GEMINI_API_KEY is present. Starting in [${NODE_ENV}] mode on port ${PORT}.`
);

export const app = express();

// Enable trust proxy so that express-rate-limit can accurately detect the client's real IP address
// in containerized/reverse-proxied hosting environments like Google Cloud Run.
app.set("trust proxy", 1);

// Assign Request-ID & Correlation-ID to track and correlate requests, and collect performance metrics
app.use(correlationIdMiddleware);
app.use((req, res, next) => {
  logger.info(`[HTTP] ${req.method} ${req.path}`, { ip: req.ip });

  metricsService.incrementRequests();
  const startTime = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - startTime;
    metricsService.recordResponseTime(duration);
  });

  next();
});

// Apply Gzip compression to reduce response payloads
app.use(compression());

// Apply Helmet for robust HTTP security headers
app.use(
  helmet({
    contentSecurityPolicy:
      NODE_ENV === "production"
        ? {
            directives: {
              defaultSrc: ["'self'"],
              scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
              styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
              fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
              imgSrc: ["'self'", "data:", "blob:", "https://*"],
              connectSrc: ["'self'", "https://*.googleapis.com", "https://*.run.app"],
              frameAncestors: [
                "'self'",
                "https://*.run.app",
                "https://ai.studio",
                "https://*.google.com",
                "https://*.googleusercontent.com",
              ],
              upgradeInsecureRequests: [],
            },
          }
        : false,
    crossOriginEmbedderPolicy: false,
  })
);

// Enable safe CORS configuration for security
const getCorsOrigin = ():
  | boolean
  | ((
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void
    ) => void) => {
  if (NODE_ENV !== "production") {
    return true; // Allow any in development to ensure seamless local environment testing
  }

  // In Production, restrict strictly to specified trusted domains
  const origins: string[] = [];

  if (env.APP_URL) {
    origins.push(env.APP_URL.trim());
  }

  if (env.ALLOWED_ORIGINS) {
    const customOrigins = env.ALLOWED_ORIGINS.split(",")
      .map((o) => o.trim())
      .filter(Boolean);
    origins.push(...customOrigins);
  }

  // Fallback if no specific configuration is found in production environment
  if (origins.length === 0) {
    const errorMsg =
      "CRITICAL CONFIGURATION ERROR: No APP_URL or ALLOWED_ORIGINS configured in production! CORS must have explicitly defined trusted origins to boot in production mode.";
    logger.error(errorMsg);
    throw new Error(errorMsg);
  }

  return (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // If no origin (e.g., server-to-server or standard local tools), allow it
    if (!origin) {
      callback(null, true);
      return;
    }

    // Check if the request's origin matches any of our permitted domains
    const isAllowed = origins.some((allowedOrigin) => {
      try {
        const allowedUrl = new URL(allowedOrigin);
        const requestUrl = new URL(origin);
        return allowedUrl.origin === requestUrl.origin;
      } catch (e) {
        // Fallback string matching if URL parsing fails
        return allowedOrigin === origin || origin.endsWith(allowedOrigin);
      }
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      logger.warn(`[CORS BLOCKED] Rejected unauthorized origin: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  };
};

app.use(
  cors({
    origin: getCorsOrigin(),
    credentials: true,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// JSON parsing middleware
app.use(
  express.json({
    limit: "1mb",
  })
);

// Helper to check Gemini API status
async function getGeminiStatus(): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return "missing_api_key";
  }
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, 3000);

  try {
    const ai = new GoogleGenAI({ apiKey });
    // Make a fast model list request with strict timeout signal
    await ai.models.list({
      config: {
        abortSignal: controller.signal,
      },
    });
    return "connected";
  } catch (err: any) {
    if (controller.signal.aborted) {
      return "error: Timeout waiting for Gemini API response (3000ms)";
    }
    return `error: ${err.message || err}`;
  } finally {
    clearTimeout(timeoutId);
  }
}

// Get version from package.json dynamically on demand
let cachedAppVersion = "1.0.0";
try {
  const pkgPath = path.join(process.cwd(), "package.json");
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
    cachedAppVersion = pkg.version || "1.0.0";
  }
} catch (e) {
  // Silent fallback
}

// API: Health - Liveness Probe (Returns 200 immediately if server is up)
app.get("/api/health/liveness", (req, res) => {
  res.status(200).json({
    status: "ok",
    checkedAt: new Date().toISOString(),
  });
});

// API: Health - Readiness Probe (Checks downstream system readiness)
app.get("/api/health/readiness", async (req, res) => {
  const geminiStatus = await getGeminiStatus();
  const cacheDiagnostics = cacheService.getDiagnostics();
  const isStrictRedis =
    req.query.strict === "true" || process.env.REDIS_REQUIRED_FOR_READINESS === "true";

  const isGeminiHealthy = geminiStatus === "connected";

  // Redis is healthy if it is connected, or if it is not configured, or if we are not in strict mode
  const isRedisHealthy =
    !cacheDiagnostics.redis.configured || cacheDiagnostics.redis.connected || !isStrictRedis;

  const isHealthy = isGeminiHealthy && isRedisHealthy;

  const cacheStatus = cacheDiagnostics.redis.configured
    ? cacheDiagnostics.redis.connected
      ? "healthy_redis"
      : isStrictRedis
        ? "unhealthy_redis"
        : "degraded_memory_fallback"
    : "healthy_memory";

  if (isHealthy) {
    res.status(200).json({
      status: "ready",
      checkedAt: new Date().toISOString(),
      dependencies: {
        gemini: "healthy",
        cache: cacheStatus,
      },
      strictMode: {
        redisRequired: isStrictRedis,
      },
    });
  } else {
    logger.error(
      `Readiness probe failed. Gemini: ${geminiStatus}, Redis (configured: ${cacheDiagnostics.redis.configured}, connected: ${cacheDiagnostics.redis.connected}, strict: ${isStrictRedis})`
    );
    res.status(503).json({
      status: "unready",
      checkedAt: new Date().toISOString(),
      dependencies: {
        gemini: geminiStatus,
        cache: cacheStatus,
      },
      strictMode: {
        redisRequired: isStrictRedis,
      },
    });
  }
});

// API: Health check (for monitoring / observability - comprehensive dashboard)
app.get("/api/health", async (req, res) => {
  const uptimeRaw = process.uptime();
  const hours = Math.floor(uptimeRaw / 3600);
  const minutes = Math.floor((uptimeRaw % 3600) / 60);
  const seconds = Math.floor(uptimeRaw % 60);
  const uptimeFormatted = `${hours}h ${minutes}m ${seconds}s`;

  const memoryUsage = process.memoryUsage();
  const memory = {
    rss: `${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB`,
    heapTotal: `${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
    heapUsed: `${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
    external: `${(memoryUsage.external / 1024 / 1024).toFixed(2)} MB`,
  };

  const geminiStatus = await getGeminiStatus();
  const cacheDiagnostics = cacheService.getDiagnostics();

  res.json({
    status: "ok",
    time: new Date().toISOString(),
    uptime: uptimeRaw,
    uptime_formatted: uptimeFormatted,
    version: cachedAppVersion,
    memory,
    node_version: process.version,
    gemini_status: geminiStatus,
    cache: cacheDiagnostics,
    metrics: metricsService.getMetrics(),
  });
});

// Swagger Documentation API UI
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Mount the modular architecture and AI services router with API Versioning support
app.use("/api", architectureRouter);
app.use("/api/v1", architectureRouter);

// Global Error Handler Middleware (Prevents stack trace leaks and formats responses uniformly)
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  const requestId = (req as any).requestId || "unknown";
  logger.error(`Unhandled error caught by global middleware [RequestID: ${requestId}]:`, err);

  const statusCode = err.status || err.statusCode || 500;
  const isDevelopment = process.env.NODE_ENV !== "production";

  res.status(statusCode).json({
    requestId,
    error: err.message || "เกิดข้อผิดพลาดในการประมวลผลระบบเซิร์ฟเวอร์",
    details: isDevelopment
      ? err.stack
      : "ระบบสวมบทบาทสถาปนิกตรวจพบความขัดข้องทางเทคนิคภายในเซิร์ฟเวอร์ กรุณาลองใหม่อีกครั้งในภายหลัง",
  });
});

// Configure serving of Vite build / middleware
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // In dev mode, mount Vite as middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve built files
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));

    // Support wildcard routing syntax for Express single-page applications
    const handleSPAFallback = (req: express.Request, res: express.Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    };
    app.get("*", handleSPAFallback);
  }

  const server = app.listen(PORT, "0.0.0.0", () => {
    logger.info(`Server running on http://localhost:${PORT}`);
  });

  // Graceful Shutdown handling for production environment resilience
  const handleShutdown = (signal: string) => {
    logger.info(`Received ${signal}. Closing HTTP server...`);
    server.close(() => {
      logger.info("HTTP server closed cleanly. Exiting process.");
      process.exit(0);
    });

    // Force exit after 10 seconds timeout
    setTimeout(() => {
      logger.error("Linger connections detected, forcing exit.");
      process.exit(1);
    }, 10000);
  };

  process.on("SIGTERM", () => handleShutdown("SIGTERM"));
  process.on("SIGINT", () => handleShutdown("SIGINT"));
}

if (process.env.NODE_ENV !== "test" && !process.env.VITEST) {
  startServer();
}
