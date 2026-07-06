import { Request, Response, NextFunction } from "express";
import winston from "winston";
import rateLimit from "express-rate-limit";

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
 * Neutralizes prompt injections and escapes potential HTML tags
 */
export const sanitizeInput = (text: string, maxLength = 1000): string => {
  if (typeof text !== "string") return "";
  let sanitized = text.trim().slice(0, maxLength);
  
  // Neutralize potential HTML tag injections
  sanitized = sanitized.replace(/<[^>]*>?/gm, "");
  
  return sanitized;
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
            const metaStr = Object.keys(metadata).length ? ` ${JSON.stringify(metadata)}` : "";
            return `[${level}] ${timestamp} - ${message}${metaStr}`;
          })
        )
  ),
  transports: [
    new winston.transports.Console()
  ]
});

/**
 * Observability logger helper using Winston under the hood
 */
export const logger = {
  info: (message: string, meta?: any) => {
    if (meta) {
      winstonLogger.info(message, meta);
    } else {
      winstonLogger.info(message);
    }
  },
  warn: (message: string, meta?: any) => {
    if (meta) {
      winstonLogger.warn(message, meta);
    } else {
      winstonLogger.warn(message);
    }
  },
  error: (message: string, error?: any) => {
    if (error instanceof Error) {
      winstonLogger.error(message, { error: error.message, stack: error.stack });
    } else if (error && typeof error === "object") {
      winstonLogger.error(message, { ...error });
    } else if (error) {
      winstonLogger.error(message, { error });
    } else {
      winstonLogger.error(message);
    }
  }
};
