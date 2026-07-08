import { describe, it, expect } from "vitest";
import { envSchema } from "./env";

describe("Environment Variable Validation Schema", () => {
  it("should successfully validate development config without CORS origins or cache tokens", () => {
    const devConfig = {
      GEMINI_API_KEY: "AIzaSyA1B2C3D4E5F6G7H8I9",
      NODE_ENV: "development",
      PORT: "3000",
    };

    const parseResult = envSchema.safeParse(devConfig);
    expect(parseResult.success).toBe(true);
    if (parseResult.success) {
      expect(parseResult.data.PORT).toBe(3000);
      expect(parseResult.data.NODE_ENV).toBe("development");
    }
  });

  it("should fail validation in production if both ALLOWED_ORIGINS and APP_URL are missing", () => {
    const prodConfigMissingOrigins = {
      GEMINI_API_KEY: "AIzaSyA1B2C3D4E5F6G7H8I9",
      NODE_ENV: "production",
      CACHE_CLEAR_TOKEN: "supersecrettoken123",
    };

    const parseResult = envSchema.safeParse(prodConfigMissingOrigins);
    expect(parseResult.success).toBe(false);
    if (!parseResult.success) {
      const errorMessages = parseResult.error.issues.map((e) => e.message);
      expect(errorMessages).toContain(
        "ALLOWED_ORIGINS or APP_URL must be specified in production to prevent permissive CORS fallback."
      );
    }
  });

  it("should fail validation in production if CACHE_CLEAR_TOKEN is missing", () => {
    const prodConfigMissingToken = {
      GEMINI_API_KEY: "AIzaSyA1B2C3D4E5F6G7H8I9",
      NODE_ENV: "production",
      ALLOWED_ORIGINS: "https://example.com",
    };

    const parseResult = envSchema.safeParse(prodConfigMissingToken);
    expect(parseResult.success).toBe(false);
    if (!parseResult.success) {
      const errorMessages = parseResult.error.issues.map((e) => e.message);
      expect(errorMessages).toContain(
        "CACHE_CLEAR_TOKEN is required in production to secure cache clearing endpoints against abuse."
      );
    }
  });

  it("should successfully validate in production when origins and cache tokens are correctly supplied", () => {
    const validProdConfig = {
      GEMINI_API_KEY: "AIzaSyA1B2C3D4E5F6G7H8I9",
      NODE_ENV: "production",
      ALLOWED_ORIGINS: "https://example.com,https://api.example.com",
      CACHE_CLEAR_TOKEN: "super-secure-token-value-2026",
    };

    const parseResult = envSchema.safeParse(validProdConfig);
    expect(parseResult.success).toBe(true);
    if (parseResult.success) {
      expect(parseResult.data.NODE_ENV).toBe("production");
      expect(parseResult.data.CACHE_CLEAR_TOKEN).toBe("super-secure-token-value-2026");
    }
  });
});
