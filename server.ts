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

// Load environment variables early (support .env.local for local dev and fallback to .env)
const envLocalPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath });
}
dotenv.config();

// Import modular API router
import architectureRouter from "./server/routes/architectureRoutes";
import { logger } from "./server/middlewares/security";
import { cacheService } from "./server/services/cacheService";

// Validate essential environment variables immediately on startup
if (!process.env.GEMINI_API_KEY) {
  logger.error("FATAL CONFIGURATION ERROR: GEMINI_API_KEY environment variable is missing!");
  console.error("\x1b[31m%s\x1b[0m", "================================================================");
  console.error("\x1b[31m%s\x1b[0m", "FATAL STARTUP ERROR: GEMINI_API_KEY is not configured.");
  console.error("\x1b[31m%s\x1b[0m", "Please configure the key in the Secrets panel or your .env file.");
  console.error("\x1b[31m%s\x1b[0m", "================================================================");
  process.exit(1);
}

const PORT = Number(process.env.PORT) || 3000;
const NODE_ENV = process.env.NODE_ENV || "development";

logger.info(`Validating environment: GEMINI_API_KEY is present. Starting in [${NODE_ENV}] mode on port ${PORT}.`);

const app = express();

// Enable trust proxy so that express-rate-limit can accurately detect the client's real IP address
// in containerized/reverse-proxied hosting environments like Google Cloud Run.
app.set("trust proxy", 1);

// Assign Request-ID to track and correlate requests, and collect performance metrics
app.use((req, res, next) => {
  const requestId = (req.headers["x-request-id"] as string) || randomUUID();
  (req as any).requestId = requestId;
  res.setHeader("X-Request-Id", requestId);
  logger.info(`[HTTP] ${req.method} ${req.path}`, { requestId, ip: req.ip });

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
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP to ensure Vite's inline scripts/resources in the preview environment aren't blocked
  crossOriginEmbedderPolicy: false,
}));

// Enable safe CORS configuration for security
const getCorsOrigin = (): boolean | ((origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => void) => {
  if (NODE_ENV !== "production") {
    return true; // Allow any in development to ensure seamless local environment testing
  }

  // In Production, restrict strictly to specified trusted domains
  const origins: string[] = [];

  if (process.env.APP_URL) {
    origins.push(process.env.APP_URL.trim());
  }

  if (process.env.ALLOWED_ORIGINS) {
    const customOrigins = process.env.ALLOWED_ORIGINS.split(",")
      .map(o => o.trim())
      .filter(Boolean);
    origins.push(...customOrigins);
  }

  // Fallback if no specific configuration is found in production environment
  if (origins.length === 0) {
    logger.warn("WARNING: No APP_URL or ALLOWED_ORIGINS configured in production! Falling back to allowing same-origin/safe requests.");
    return true;
  }

  return (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // If no origin (e.g., server-to-server or standard local tools), allow it
    if (!origin) {
      callback(null, true);
      return;
    }

    // Check if the request's origin matches any of our permitted domains
    const isAllowed = origins.some(allowedOrigin => {
      try {
        const allowedUrl = new URL(allowedOrigin);
        const requestUrl = new URL(origin);
        return allowedUrl.hostname === requestUrl.hostname;
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

app.use(cors({
  origin: getCorsOrigin(),
  credentials: true,
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// JSON parsing middleware
app.use(express.json({
  limit: "1mb"
}));

// Helper to check Gemini API status
async function getGeminiStatus(): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return "missing_api_key";
  }
  try {
    const ai = new GoogleGenAI({ apiKey });
    // Use list with a limit to make a fast status-check call
    const listPromise = ai.models.list();
    
    // Fast 3-second timeout to prevent the health check from hanging if Gemini is unresponsive
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Timeout waiting for Gemini API response")), 3000)
    );
    
    await Promise.race([listPromise, timeoutPromise]);
    return "connected";
  } catch (err: any) {
    return `error: ${err.message || err}`;
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

// API: Health check (for monitoring / observability)
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
    metrics: metricsService.getMetrics()
  });
});

// Swagger Documentation API UI
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Mount the modular architecture and AI services router
app.use("/api", architectureRouter);

// Global Error Handler Middleware (Prevents stack trace leaks and formats responses uniformly)
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  const requestId = (req as any).requestId || "unknown";
  logger.error(`Unhandled error caught by global middleware [RequestID: ${requestId}]:`, err);

  const statusCode = err.status || err.statusCode || 500;
  const isDevelopment = process.env.NODE_ENV !== "production";

  res.status(statusCode).json({
    requestId,
    error: err.message || "เกิดข้อผิดพลาดในการประมวลผลระบบเซิร์ฟเวอร์",
    details: isDevelopment ? err.stack : "ระบบสวมบทบาทสถาปนิกตรวจพบความขัดข้องทางเทคนิคภายในเซิร์ฟเวอร์ กรุณาลองใหม่อีกครั้งในภายหลัง"
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
    
    // Support wildcard routing syntax for both Express v4 (*) and Express v5 (*all)
    const handleSPAFallback = (req: express.Request, res: express.Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    };
    app.get("*", handleSPAFallback);
    app.get("*all", handleSPAFallback);
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

startServer();
