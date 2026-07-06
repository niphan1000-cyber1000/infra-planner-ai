import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { cacheService } from "./cacheService";

describe("Cache Service - Dual-layer Caching Engine", () => {
  beforeEach(async () => {
    // Clear the cache and reset stats before each test
    await cacheService.clear();
    cacheService.stats.hits = 0;
    cacheService.stats.misses = 0;
    cacheService.stats.memoryHits = 0;
    cacheService.stats.redisHits = 0;
  });

  it("should generate a stable SHA-256 hash key regardless of property ordering", () => {
    const payloadA = { a: 1, b: "test", c: [1, 2] };
    const payloadB = { b: "test", c: [1, 2], a: 1 }; // Rearranged keys

    const keyA = cacheService.generateHashKey("test", payloadA);
    const keyB = cacheService.generateHashKey("test", payloadB);

    expect(keyA).toBe(keyB);
    expect(keyA).toContain("test:");
  });

  it("should cache and retrieve values using memory fallback when Redis is offline", async () => {
    const key = "test:mem_fallback";
    const data = { enterpriseRole: "Lead Architect", tier: 3 };

    // Get non-existent key (miss)
    const missResult = await cacheService.get(key);
    expect(missResult).toBeNull();
    expect(cacheService.stats.misses).toBe(1);

    // Set cache entry
    await cacheService.set(key, data, 60);

    // Get existing key (hit)
    const hitResult = await cacheService.get<{ enterpriseRole: string; tier: number }>(key);
    expect(hitResult).not.toBeNull();
    expect(hitResult?.value).toEqual(data);
    expect(hitResult?.source).toBe("memory");
    expect(cacheService.stats.hits).toBe(1);
    expect(cacheService.stats.memoryHits).toBe(1);
  });

  it("should enforce cache TTL expiration correctly", async () => {
    const key = "test:expiry";
    const data = "temporary_session";

    vi.useFakeTimers();

    // Cache with a 5-second TTL
    await cacheService.set(key, data, 5);

    // Get immediately (valid)
    const active = await cacheService.get(key);
    expect(active?.value).toBe(data);

    // Advance clock by 6 seconds (expired)
    vi.advanceTimersByTime(6000);

    const expired = await cacheService.get(key);
    expect(expired).toBeNull();

    vi.useRealTimers();
  });

  it("should support clearing all cached entries completely", async () => {
    const key1 = "test:clear1";
    const key2 = "test:clear2";

    await cacheService.set(key1, "val1");
    await cacheService.set(key2, "val2");

    await cacheService.clear();

    const check1 = await cacheService.get(key1);
    const check2 = await cacheService.get(key2);

    expect(check1).toBeNull();
    expect(check2).toBeNull();
  });

  it("should return valid diagnostics configuration metadata", () => {
    const diagnostics = cacheService.getDiagnostics();
    expect(diagnostics).toHaveProperty("redis");
    expect(diagnostics).toHaveProperty("memory");
    expect(diagnostics).toHaveProperty("stats");
    expect(diagnostics.memory.maxLimit).toBe(1000);
  });
});
