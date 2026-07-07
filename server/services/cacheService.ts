import Redis from "ioredis";
import crypto from "crypto";
import { logger } from "../middlewares/security";

// Dual-layer Cache Strategy: Redis + In-Memory Fallback
class CacheService {
  private redisClient: Redis | null = null;
  private isRedisConnected = false;
  private memoryCache = new Map<string, { value: any; expiry: number }>();
  private maxMemorySize = 1000; // Limit memory cache to 1000 entries to prevent memory leaks
  private activePromises = new Map<string, Promise<any>>();

  // Metrics for Monitoring Dashboard
  public stats = {
    hits: 0,
    misses: 0,
    redisHits: 0,
    memoryHits: 0,
    redisErrors: 0,
    keysCount: 0,
  };

  constructor() {
    this.initializeRedis();
  }

  private initializeRedis() {
    const redisUrl = process.env.REDIS_URL;
    
    if (!redisUrl) {
      logger.info("REDIS_URL is not configured. Falling back to high-performance local In-Memory Cache.");
      return;
    }

    try {
      logger.info(`Initializing Redis client connecting to specified URL...`);
      // Initialize Redis client with reasonable connect & command timeouts
      this.redisClient = new Redis(redisUrl, {
        connectTimeout: 3000,
        maxRetriesPerRequest: 1,
        retryStrategy: (times) => {
          // If Redis is down, retry up to 3 times, then stop to avoid infinite logging
          if (times > 3) {
            logger.warn("Redis reconnection attempts exceeded. Redis will remain offline.");
            return null;
          }
          return Math.min(times * 1000, 3000);
        },
      });

      this.redisClient.on("connect", () => {
        logger.info("Successfully established connection to Redis Server.");
      });

      this.redisClient.on("ready", () => {
        this.isRedisConnected = true;
        logger.info("Redis Server is ready to receive commands.");
      });

      this.redisClient.on("error", (error) => {
        this.isRedisConnected = false;
        this.stats.redisErrors++;
        logger.error("Redis connection error encountered:", error.message || error);
      });

      this.redisClient.on("close", () => {
        this.isRedisConnected = false;
        logger.warn("Redis connection closed.");
      });
    } catch (err: any) {
      this.redisClient = null;
      this.isRedisConnected = false;
      logger.error("Failed to initialize Redis client:", err.message || err);
    }
  }

  /**
   * Generates a stable and safe SHA-256 hash key for caching any structured request payload.
   * Recursively sorts keys to prevent cache collisions and ensures deep object serialization.
   */
  public generateHashKey(prefix: string, payload: any): string {
    const stableSerialize = (obj: any): any => {
      if (obj === null || typeof obj !== "object") {
        return obj;
      }
      if (Array.isArray(obj)) {
        return obj.map(stableSerialize);
      }
      const sortedKeys = Object.keys(obj).sort();
      const result: any = {};
      for (const key of sortedKeys) {
        result[key] = stableSerialize(obj[key]);
      }
      return result;
    };

    const sortedObj = stableSerialize(payload);
    const sortedStr = JSON.stringify(sortedObj);
    const hash = crypto.createHash("sha256").update(sortedStr).digest("hex");
    return `${prefix}:${hash}`;
  }

  /**
   * Get item from the cache (checks Redis first, falls back to Memory Cache)
   */
  public async get<T>(key: string): Promise<{ value: T; source: "redis" | "memory" } | null> {
    // 1. Try Redis first if connected
    if (this.redisClient && this.isRedisConnected) {
      try {
        const data = await this.redisClient.get(key);
        if (data) {
          this.stats.hits++;
          this.stats.redisHits++;
          return { value: JSON.parse(data), source: "redis" };
        }
      } catch (err: any) {
        this.stats.redisErrors++;
        logger.error(`Redis get error for key [${key}]:`, err.message || err);
        // Fall through to memory cache if Redis fails
      }
    }

    // 2. Try In-Memory Cache
    const memItem = this.memoryCache.get(key);
    if (memItem) {
      if (memItem.expiry > Date.now()) {
        this.stats.hits++;
        this.stats.memoryHits++;
        return { value: memItem.value, source: "memory" };
      } else {
        // Expired item cleanup
        this.memoryCache.delete(key);
      }
    }

    this.stats.misses++;
    return null;
  }

  /**
   * Set item into cache (writes to both Redis and Memory Cache for consistency)
   */
  public async set(key: string, value: any, ttlSeconds = 86400): Promise<void> {
    const valueString = JSON.stringify(value);

    // 1. Write to Redis if connected
    if (this.redisClient && this.isRedisConnected) {
      try {
        await this.redisClient.setex(key, ttlSeconds, valueString);
      } catch (err: any) {
        this.stats.redisErrors++;
        logger.error(`Redis set error for key [${key}]:`, err.message || err);
      }
    }

    // 2. Write to In-Memory Cache (double-caching/local fallback)
    // Enforce size limit by evicting the oldest key (FIFO)
    if (this.memoryCache.size >= this.maxMemorySize) {
      const oldestKey = this.memoryCache.keys().next().value;
      if (oldestKey) {
        this.memoryCache.delete(oldestKey);
      }
    }

    const expiry = Date.now() + ttlSeconds * 1000;
    this.memoryCache.set(key, { value, expiry });
    this.stats.keysCount = this.memoryCache.size;
  }

  /**
   * Clear all cached keys belonging to this app (Redis selective scan + Memory)
   */
  public async clear(): Promise<void> {
    this.memoryCache.clear();
    this.stats.keysCount = 0;

    if (this.redisClient && this.isRedisConnected) {
      try {
        const patterns = ["arch:*", "chat:*"];
        let deletedCount = 0;

        for (const pattern of patterns) {
          let cursor = "0";
          do {
            const [nextCursor, keys] = await this.redisClient.scan(
              cursor,
              "MATCH",
              pattern,
              "COUNT",
              100
            );
            cursor = nextCursor;
            if (keys && keys.length > 0) {
              await this.redisClient.del(...keys);
              deletedCount += keys.length;
            }
          } while (cursor !== "0");
        }

        logger.info(`Cleared ${deletedCount} Redis keys matching application patterns selectively.`);
      } catch (err: any) {
        logger.error("Redis selective clear error:", err.message || err);
      }
    }
  }

  /**
   * Get an item from the cache, or if it's a miss, fetch it using fetchFn.
   * Uses the Single Flight pattern (Cache Stampede Protection) to ensure that if multiple identical
   * requests arrive concurrently on a cache miss, only one fetch is executed while the others wait and join.
   */
  public async getOrFetch<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttlSeconds = 86400
  ): Promise<{ value: T; source: "redis" | "memory" | "in-flight" }> {
    // 1. Try to get from cache first
    const cached = await this.get<T>(key);
    if (cached) {
      return { value: cached.value, source: cached.source };
    }

    // 2. Check if there is an active in-flight request for this key (coalescing)
    let active = this.activePromises.get(key);
    if (active) {
      logger.info(`[CACHE STAMPEDE PROTECTION] Concurrently joining active in-flight request for key: [${key}]`);
      const val = await active;
      return { value: val, source: "in-flight" };
    }

    // 3. Create a new active request promise
    const promise = (async () => {
      const val = await fetchFn();
      await this.set(key, val, ttlSeconds);
      return val;
    })();

    this.activePromises.set(key, promise);

    try {
      const val = await promise;
      return { value: val, source: "in-flight" };
    } finally {
      this.activePromises.delete(key);
    }
  }

  /**
   * Returns current cache layer diagnostic metadata and status
   */
  public getDiagnostics() {
    return {
      redis: {
        configured: !!process.env.REDIS_URL,
        connected: this.isRedisConnected,
        errors: this.stats.redisErrors,
      },
      memory: {
        entriesCount: this.memoryCache.size,
        maxLimit: this.maxMemorySize,
      },
      stats: {
        totalHits: this.stats.hits,
        redisHits: this.stats.redisHits,
        memoryHits: this.stats.memoryHits,
        totalMisses: this.stats.misses,
        hitRatio: this.stats.hits + this.stats.misses > 0 
          ? (this.stats.hits / (this.stats.hits + this.stats.misses)).toFixed(4) 
          : "0.0000",
      }
    };
  }
}

export const cacheService = new CacheService();
