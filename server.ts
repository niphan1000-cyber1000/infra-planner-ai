import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import rateLimit from "express-rate-limit";
import cors from "cors";

// Load environment variables early
dotenv.config();

// Import modular API router
import architectureRouter from "./server/routes/architectureRoutes";
import { logger } from "./server/middlewares/security";

const app = express();
const PORT = 3000;

// Enable safe CORS configuration for security
app.use(cors({
  origin: true,
  credentials: true,
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Configure Rate Limiting to prevent brute-forcing/DOS of LLM endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 50 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "คุณส่งคำขอมากเกินไปในระบบกรุณารอ 15 นาทีก่อนลองใหม่อีกครั้ง",
  },
});

// JSON parsing middleware
app.use(express.json());

// API: Health check (for monitoring / observability)
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Apply rate limiter specifically to AI endpoints, then mount the modular router
app.use("/api", apiLimiter, architectureRouter);

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
