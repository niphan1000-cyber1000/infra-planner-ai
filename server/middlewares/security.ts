import { Request, Response, NextFunction } from "express";
import winston from "winston";
import rateLimit from "express-rate-limit";
import crypto from "crypto";
import { AsyncLocalStorage } from "async_hooks";

/**
 * AsyncLocalStorage instance to hold the Request/Correlation ID in the execution context
 */
export const requestStore = new AsyncLocalStorage<string>();

/**
 * Middleware: Correlation-ID & Request-ID Generator / Context Injector
 * Binds every request to an AsyncLocalStorage context so all nested logs automatically trace back to it.
 */
export const correlationIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const requestId = (req.headers["x-request-id"] as string) || (req.headers["x-correlation-id"] as string) || crypto.randomUUID();
  
  // Back-propagate headers for tracking
  req.headers["x-request-id"] = requestId;
  req.headers["x-correlation-id"] = requestId;
  res.setHeader("X-Request-Id", requestId);
  res.setHeader("X-Correlation-Id", requestId);
  (req as any).requestId = requestId;

  requestStore.run(requestId, () => {
    next();
  });
};

/**
 * Generate a cryptographically secure random 32-character hex token at boot
 * if no custom CACHE_CLEAR_TOKEN is configured in the environment.
 */
export const runtimeCacheClearToken = process.env.CACHE_CLEAR_TOKEN || crypto.randomBytes(16).toString("hex");

/**
 * Rate limiter for heavy system architecture analysis (strict limit)
 * Limit each IP to 15 requests per 15 minutes to save budget and quota.
 */
export const architectureLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "คุณส่งคำขอวิเคราะห์สถาปัตยกรรมมากเกินไปในระบบกรุณารอ 15 นาทีก่อนลองใหม่อีกครั้ง",
  }
});

/**
 * Rate limiter for interactive chat advisor conversations (moderate limit)
 * Limit each IP to 50 requests per 15 minutes.
 */
export const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "คุณส่งคำขอแชทกับผู้ช่วยมากเกินไปในระบบกรุณารอ 15 นาทีก่อนลองใหม่อีกครั้ง",
  }
});

/**
 * Rate limiter for cache clearing operations (extremely strict limit)
 * Limit each IP to 5 requests per 1 hour to prevent cache flush abuse.
 */
export const cacheClearLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "คุณส่งคำขอล้างข้อมูลแคชบ่อยเกินไป กรุณารอ 1 ชั่วโมงก่อนลองใหม่อีกครั้ง",
  }
});

/**
 * Authorization middleware for cache clearing.
 * Requires a Bearer token matching CACHE_CLEAR_TOKEN or the secure, dynamic runtimeCacheClearToken.
 */
export const validateCacheClearAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Unauthorized",
      details: "ต้องระบุสิทธิ์ผู้ดูแลระบบในรูปแบบ Bearer Token เพื่อล้างแคชระบบ"
    });
  }

  const token = authHeader.substring(7).trim();
  if (token !== runtimeCacheClearToken) {
    return res.status(403).json({
      error: "Forbidden",
      details: "รหัสผ่านผู้ดูแลระบบสำหรับล้างแคชไม่ถูกต้อง"
    });
  }

  next();
};

/**
 * Neutralizes prompt injections and escapes potential HTML tags
 */
export const sanitizeInput = (text: string, maxLength = 1000): string => {
  if (typeof text !== "string") return "";
  let sanitized = text.trim().slice(0, maxLength);
  
  // Neutralize potential HTML tag injections
  sanitized = sanitized.replace(/<[^>]*>?/gm, "");
  
  return sanitized;
};

/**
 * Regular expressions for common Prompt Injection techniques (Deny List)
 * Covers system instruction overrides, role changing, and system prompt leakage attempts.
 */
const PROMPT_INJECTION_PATTERNS = [
  // English Patterns
  /ignore\s+(?:all\s+)?(?:previous\s+)?(?:instructions|directives|rules|system|prompts)/i,
  /reset\s+(?:all\s+)?(?:instructions|directives|rules|system|prompts)/i,
  /reveal\s+(?:your\s+)?(?:system\s+)?(?:prompt|rules|instructions|guidelines)/i,
  /output\s+(?:your\s+)?(?:system\s+)?(?:prompt|rules|instructions|api\s*key|credentials|secrets)/i,
  /show\s+(?:your\s+)?(?:system\s+)?(?:prompt|rules|instructions|api\s*key|credentials|secrets)/i,
  /print\s+(?:your\s+)?(?:system\s+)?(?:prompt|rules|instructions|api\s*key|credentials|secrets)/i,
  /leak\s+(?:your\s+)?(?:system\s+)?(?:prompt|rules|instructions|api\s*key|credentials|secrets)/i,
  /system\s+prompt\s+leak/i,
  /you\s+are\s+now\s+(?:a|an|the)/i,
  /act\s+as\s+(?:a|an|the)/i,
  /override\s+(?:the\s+)?(?:rules|instructions|prompt)/i,
  
  // Thai Patterns
  /ละเว้นคำสั่ง/i,
  /ข้ามคำสั่ง/i,
  /ยกเลิกคำสั่งก่อนหน้า/i,
  /เปิดเผยคำสั่ง/i,
  /แสดงคำสั่งระบบ/i,
  /ขอบทบาท/i,
  /เปลี่ยนบทบาท/i,
  /จงลืม/i,
  /แสดง\s*(?:api\s*key|รหัส\s*ผ่าน|คีย์\s*ระบบ|token)/i,
  /ขอ\s*(?:api\s*key|รหัส\s*ผ่าน|คีย์\s*ระบบ|token)/i,
  /เปิดเผย\s*(?:api\s*key|รหัส\s*ผ่าน|คีย์\s*ระบบ|token)/i,
];

/**
 * Scans a given string for potential prompt injection attempts.
 */
export const hasPromptInjectionAttempt = (text: string): boolean => {
  if (typeof text !== "string") return false;
  return PROMPT_INJECTION_PATTERNS.some((pattern) => pattern.test(text));
};

/**
 * Scans Gemini output for signs of system instruction disclosure or API key leakage.
 */
export const hasOutputLeakage = (text: string): boolean => {
  if (typeof text !== "string") return false;
  
  const leakPatterns = [
    /CRITICAL SECURITY MANDATE/i,
    /USER_PROVIDED_DATA_/i,
    /USER_PROVIDED_CHAT_/i,
    /systemInstruction/i,
    /getGeminiClient/i,
    /CACHE_CLEAR_TOKEN/i,
    /AIzaSy[A-Za-z0-9_-]{30,40}/, // Google API Key pattern
  ];
  
  return leakPatterns.some((pattern) => pattern.test(text));
};

/**
 * Filters the stack trace to exclude third-party library noise (node_modules, internals).
 * This keeps logging clear and pinpointed to application logic.
 */
export const filterStack = (stack: string | undefined): string | undefined => {
  if (!stack) return undefined;
  return stack
    .split("\n")
    .filter((line) => {
      const lower = line.toLowerCase();
      return (
        !lower.includes("node_modules") &&
        !lower.includes("node:internal") &&
        !lower.includes("node:net") &&
        !lower.includes("node:events") &&
        !lower.includes("node:process") &&
        !lower.includes("express/lib") &&
        !lower.includes("vitest/dist")
      );
    })
    .join("\n");
};

// Configure underlying Winston logger instance
const winstonLogger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    process.env.NODE_ENV === "production"
      ? winston.format.json()
      : winston.format.combine(
          winston.format.colorize(),
          winston.format.printf(({ timestamp, level, message, ...metadata }) => {
            let metaStr = "";
            const reqId = metadata.requestId && metadata.requestId !== "N/A" ? ` [Request ID: ${metadata.requestId}]` : "";
            
            // Extract core fields to print them beautifully
            const errVal = metadata.error;
            const stackVal = metadata.stack;
            const causeVal = metadata.cause;
            
            // Clean metadata of extracted fields
            const cleanMeta = { ...metadata };
            delete cleanMeta.requestId;
            delete cleanMeta.error;
            delete cleanMeta.stack;
            delete cleanMeta.cause;
            
            if (Object.keys(cleanMeta).length) {
              metaStr = ` ${JSON.stringify(cleanMeta)}`;
            }
            
            let logLine = `[${level}] ${timestamp}${reqId} - ${message}${metaStr}`;
            
            if (errVal) {
              logLine += `\n  Details: ${errVal}`;
            }
            if (causeVal) {
              logLine += `\n  Cause: ${typeof causeVal === "object" ? JSON.stringify(causeVal) : causeVal}`;
            }
            if (stackVal) {
              logLine += `\n  Filtered Stack Trace:\n${stackVal}`;
            }
            return logLine;
          })
        )
  ),
  transports: [
    new winston.transports.Console()
  ]
});

/**
 * Observability logger helper using Winston under the hood
 * Automatically binds the active requestId / correlationId from AsyncLocalStorage if present.
 */
export const logger = {
  info: (message: string, meta?: any) => {
    const requestId = requestStore.getStore();
    const payload = requestId ? { requestId, ...meta } : meta;
    if (payload) {
      winstonLogger.info(message, payload);
    } else {
      winstonLogger.info(message);
    }
  },
  warn: (message: string, meta?: any) => {
    const requestId = requestStore.getStore();
    const payload = requestId ? { requestId, ...meta } : meta;
    if (payload) {
      winstonLogger.warn(message, payload);
    } else {
      winstonLogger.warn(message);
    }
  },
  error: (message: string, error?: any) => {
    const requestId = requestStore.getStore();
    let metaPayload: any = { requestId: requestId || "N/A" };
    
    if (error instanceof Error) {
      metaPayload.error = error.message;
      metaPayload.stack = filterStack(error.stack);
      if ((error as any).cause) {
        const nestedCause = (error as any).cause;
        metaPayload.cause = nestedCause instanceof Error
          ? { message: nestedCause.message, stack: filterStack(nestedCause.stack) }
          : nestedCause;
      }
    } else if (error && typeof error === "object") {
      metaPayload.error = error.message || error.error || JSON.stringify(error);
      if (error.stack) {
        metaPayload.stack = filterStack(String(error.stack));
      }
      if (error.cause) {
        metaPayload.cause = error.cause;
      }
      // Mix in any other custom attributes that might be on the error object
      for (const [key, val] of Object.entries(error)) {
        if (key !== "message" && key !== "stack" && key !== "cause") {
          metaPayload[key] = val;
        }
      }
    } else if (error) {
      metaPayload.error = String(error);
    }
    
    winstonLogger.error(message, metaPayload);
  }
};
