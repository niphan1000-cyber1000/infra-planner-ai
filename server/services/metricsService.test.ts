import { describe, it, expect, beforeEach } from "vitest";
import { metricsService } from "./metricsService";

describe("Metrics Service", () => {
  beforeEach(() => {
    metricsService.reset();
  });

  it("should initialize with default zeros", () => {
    const metrics = metricsService.getMetrics();
    expect(metrics.totalRequests).toBe(0);
    expect(metrics.avgResponseTimeMs).toBe(0);
    expect(metrics.geminiCalls).toBe(0);
    expect(metrics.geminiErrors).toBe(0);
    expect(metrics.geminiErrorRate).toBe("0.00%");
  });

  it("should record requests correctly", () => {
    metricsService.incrementRequests();
    metricsService.incrementRequests();
    const metrics = metricsService.getMetrics();
    expect(metrics.totalRequests).toBe(2);
  });

  it("should compute average response times accurately", () => {
    metricsService.recordResponseTime(100);
    metricsService.recordResponseTime(200);
    metricsService.recordResponseTime(300);
    const metrics = metricsService.getMetrics();
    expect(metrics.avgResponseTimeMs).toBe(200); // (100 + 200 + 300) / 3 = 200
  });

  it("should calculate Gemini error rate as a formatted percentage", () => {
    metricsService.incrementGeminiCalls();
    metricsService.incrementGeminiCalls();
    metricsService.incrementGeminiCalls();
    metricsService.incrementGeminiCalls(); // 4 calls
    metricsService.incrementGeminiErrors(); // 1 error (25%)

    const metrics = metricsService.getMetrics();
    expect(metrics.geminiCalls).toBe(4);
    expect(metrics.geminiErrors).toBe(1);
    expect(metrics.geminiErrorRate).toBe("25.00%");
  });
});
