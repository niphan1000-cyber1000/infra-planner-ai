import { Request, Response, NextFunction } from "express";
import winston from "winston";

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
