import { Request, Response, NextFunction } from "express";

/**
 * Neutralizes prompt injections and escapes potential HTML tags
 */
export const sanitizeInput = (text: string, maxLength = 1000): string => {
  if (typeof text !== "string") return "";
  let sanitized = text.trim().slice(0, maxLength);
  
  const forbiddenPatterns = [
    /system instruction/gi,
    /ignore previous/gi,
    /ignore instructions/gi,
    /you are now/gi,
    /system override/gi,
    /override rule/gi,
    /translate to/gi,
    /คุณคือ/gi,
    /เปลี่ยนสวมบทบาท/gi,
    /จงเพิกเฉย/gi
  ];
  
  for (const pattern of forbiddenPatterns) {
    sanitized = sanitized.replace(pattern, "[redacted]");
  }
  
  // Neutralize potential HTML tag injections
  sanitized = sanitized.replace(/<[^>]*>?/gm, "");
  
  return sanitized;
};

/**
 * Observability logger helper
 */
export const logger = {
  info: (message: string, meta?: any) => {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, meta ? JSON.stringify(meta) : "");
  },
  warn: (message: string, meta?: any) => {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, meta ? JSON.stringify(meta) : "");
  },
  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error || "");
  }
};
