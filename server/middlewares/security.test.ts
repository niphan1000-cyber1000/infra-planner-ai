import { describe, it, expect, vi } from "vitest";
import { sanitizeInput, validateCacheClearAuth, runtimeCacheClearToken } from "./security";

describe("Security Middleware - Input Sanitization", () => {
  it("should trim surrounding whitespace from input text", () => {
    const rawInput = "   Enterprise Cloud Architecture   ";
    const result = sanitizeInput(rawInput);
    expect(result).toBe("Enterprise Cloud Architecture");
  });

  it("should strip potential HTML injection tags completely", () => {
    const maliciousInput = "<script>alert('inject')</script>Hello <b>World</b>";
    const result = sanitizeInput(maliciousInput);
    expect(result).toBe("alert('inject')Hello World");
  });

  it("should truncate long user input to specified maxLength boundary", () => {
    const longInput = "a".repeat(1500);
    const result = sanitizeInput(longInput, 500);
    expect(result).toHaveLength(500);
    expect(result).toBe("a".repeat(500));
  });

  it("should handle non-string arguments gracefully by returning an empty string", () => {
    const result = sanitizeInput(null as any);
    expect(result).toBe("");
  });
});

describe("Security Middleware - Cache Clear Authorization", () => {
  it("should block request with 401 if Authorization header is missing", () => {
    const req = { headers: {} } as any;
    let statusValue = 0;
    const res = {
      status: (code: number) => {
        statusValue = code;
        return {
          json: (data: any) => data
        };
      }
    } as any;
    const next = vi.fn();

    validateCacheClearAuth(req, res, next);
    expect(statusValue).toBe(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("should block request with 403 if token is invalid", () => {
    const req = { headers: { authorization: "Bearer invalid-token-123" } } as any;
    let statusValue = 0;
    const res = {
      status: (code: number) => {
        statusValue = code;
        return {
          json: (data: any) => data
        };
      }
    } as any;
    const next = vi.fn();

    validateCacheClearAuth(req, res, next);
    expect(statusValue).toBe(403);
    expect(next).not.toHaveBeenCalled();
  });

  it("should allow request and call next() if token matches dynamic runtimeCacheClearToken", () => {
    const req = { headers: { authorization: `Bearer ${runtimeCacheClearToken}` } } as any;
    const res = {} as any;
    const next = vi.fn();

    validateCacheClearAuth(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});
