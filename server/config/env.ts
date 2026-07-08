import { z } from "zod";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { logger } from "../middlewares/security";

// Load env vars if this file is imported first
const envLocalPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath });
}
dotenv.config();

export const envSchema = z
  .object({
    GEMINI_API_KEY: z.string().min(1, "GEMINI_API_KEY is required for the application to function"),
    PORT: z.coerce.number().default(3000),
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    REDIS_URL: z.string().optional(),
    APP_URL: z.string().optional(),
    ALLOWED_ORIGINS: z.string().optional(),
    CACHE_CLEAR_TOKEN: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.NODE_ENV === "production") {
      if (!data.ALLOWED_ORIGINS && !data.APP_URL) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["ALLOWED_ORIGINS"],
          message:
            "ALLOWED_ORIGINS or APP_URL must be specified in production to prevent permissive CORS fallback.",
        });
      }
      if (!data.CACHE_CLEAR_TOKEN) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["CACHE_CLEAR_TOKEN"],
          message:
            "CACHE_CLEAR_TOKEN is required in production to secure cache clearing endpoints against abuse.",
        });
      }
    }
  });

let parsedEnv: z.infer<typeof envSchema>;

try {
  parsedEnv = envSchema.parse(process.env);
} catch (error: any) {
  if (error instanceof z.ZodError) {
    logger.error("❌ Environment validation failed:", error.format());
    console.error(
      "\x1b[31m%s\x1b[0m",
      "================================================================"
    );
    console.error(
      "\x1b[31m%s\x1b[0m",
      "FATAL STARTUP ERROR: Environment Validation Failed via Zod."
    );
    console.error(JSON.stringify(error.format(), null, 2));
    console.error(
      "\x1b[31m%s\x1b[0m",
      "================================================================"
    );
  } else {
    logger.error("❌ Unexpected environment validation error:", error);
  }
  process.exit(1);
}

export const env = parsedEnv;
export type EnvType = z.infer<typeof envSchema>;
