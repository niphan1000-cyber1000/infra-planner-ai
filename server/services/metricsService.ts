/**
 * Observability Metrics Service for tracking request frequencies, latency, and LLM call statistics.
 */
class MetricsService {
  private totalRequests = 0;
  private totalResponseTime = 0; // Cumulative duration in milliseconds
  private responseTimeCount = 0;

  private geminiCalls = 0;
  private geminiErrors = 0;

  /**
   * Tracks a new HTTP request
   */
  public incrementRequests() {
    this.totalRequests++;
  }

  /**
   * Records execution duration for a request
   */
  public recordResponseTime(ms: number) {
    if (ms > 0) {
      this.totalResponseTime += ms;
      this.responseTimeCount++;
    }
  }

  /**
   * Records a Gemini API call attempt
   */
  public incrementGeminiCalls() {
    this.geminiCalls++;
  }

  /**
   * Records a Gemini API call error
   */
  public incrementGeminiErrors() {
    this.geminiErrors++;
  }

  /**
   * Returns calculated real-time operational metrics
   */
  public getMetrics() {
    const avgResponseTimeMs = this.responseTimeCount > 0
      ? Math.round(this.totalResponseTime / this.responseTimeCount)
      : 0;

    const geminiErrorRate = this.geminiCalls > 0
      ? ((this.geminiErrors / this.geminiCalls) * 100).toFixed(2) + "%"
      : "0.00%";

    return {
      totalRequests: this.totalRequests,
      avgResponseTimeMs,
      geminiCalls: this.geminiCalls,
      geminiErrors: this.geminiErrors,
      geminiErrorRate,
    };
  }

  /**
   * Reset metrics counters if requested
   */
  public reset() {
    this.totalRequests = 0;
    this.totalResponseTime = 0;
    this.responseTimeCount = 0;
    this.geminiCalls = 0;
    this.geminiErrors = 0;
  }
}

export const metricsService = new MetricsService();
