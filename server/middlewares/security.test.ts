import { describe, it, expect } from "vitest";
import { sanitizeInput } from "./security";

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
