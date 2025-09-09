import { createClient } from "redis";

// Redis connection configuration
const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        console.error("Redis connection failed after 10 retries");
        return new Error("Redis connection failed");
      }
      return Math.min(retries * 100, 3000);
    },
  },
});

// Redis connection monitoring and statistics
const redisStats = {
  connectionAttempts: 0,
  successfulConnections: 0,
  failedConnections: 0,
  disconnections: 0,
  lastConnectionTime: null as Date | null,
  lastDisconnectionTime: null as Date | null,
  totalCommands: 0,
  successfulCommands: 0,
  failedCommands: 0,
  averageLatency: 0,
  latencyHistory: [] as number[],
};

// Enhanced event handlers with monitoring
redisClient.on("error", (err) => {
  redisStats.failedConnections++;
  console.error("🔴 Redis connection error:", {
    error: err.message,
    timestamp: new Date().toISOString(),
    connectionAttempts: redisStats.connectionAttempts,
    failedConnections: redisStats.failedConnections,
  });
});

redisClient.on("connect", () => {
  redisStats.connectionAttempts++;
  redisStats.lastConnectionTime = new Date();
  console.log("🔴 Redis connection attempt:", {
    attempt: redisStats.connectionAttempts,
    timestamp: redisStats.lastConnectionTime.toISOString(),
  });
});

redisClient.on("ready", () => {
  redisStats.successfulConnections++;
  console.log("🔴 Redis is ready to accept commands:", {
    successfulConnections: redisStats.successfulConnections,
    timestamp: new Date().toISOString(),
    uptime: redisStats.lastConnectionTime
      ? Date.now() - redisStats.lastConnectionTime.getTime()
      : 0,
  });
});

redisClient.on("end", () => {
  redisStats.disconnections++;
  redisStats.lastDisconnectionTime = new Date();
  console.log("🔴 Redis connection ended:", {
    disconnections: redisStats.disconnections,
    timestamp: redisStats.lastDisconnectionTime.toISOString(),
    sessionDuration: redisStats.lastConnectionTime
      ? redisStats.lastDisconnectionTime.getTime() -
        redisStats.lastConnectionTime.getTime()
      : 0,
  });
});

redisClient.on("reconnecting", () => {
  console.log("🔄 Redis reconnecting:", {
    timestamp: new Date().toISOString(),
    attempt: redisStats.connectionAttempts + 1,
  });
});

// Connect to Redis
const connectRedis = async () => {
  try {
    await redisClient.connect();
    console.log("🔴 Redis connection established");
  } catch (error) {
    console.error("🔴 Failed to connect to Redis:", error);
    process.exit(1);
  }
};

// Helper function to track command execution
const trackCommand = async <T>(
  commandName: string,
  key: string,
  operation: () => Promise<T>
): Promise<T> => {
  const start = Date.now();
  redisStats.totalCommands++;

  try {
    const result = await operation();
    const latency = Date.now() - start;

    redisStats.successfulCommands++;
    redisStats.latencyHistory.push(latency);

    // Keep only last 100 latency measurements
    if (redisStats.latencyHistory.length > 100) {
      redisStats.latencyHistory.shift();
    }

    // Calculate average latency
    redisStats.averageLatency =
      redisStats.latencyHistory.reduce((sum, lat) => sum + lat, 0) /
      redisStats.latencyHistory.length;

    console.log(`✅ Redis ${commandName}:`, {
      key,
      latency: `${latency}ms`,
      averageLatency: `${Math.round(redisStats.averageLatency)}ms`,
      successRate: `${Math.round(
        (redisStats.successfulCommands / redisStats.totalCommands) * 100
      )}%`,
    });

    return result;
  } catch (error) {
    const latency = Date.now() - start;
    redisStats.failedCommands++;

    console.error(`❌ Redis ${commandName} error:`, {
      key,
      error: error instanceof Error ? error.message : "Unknown error",
      latency: `${latency}ms`,
      successRate: `${Math.round(
        (redisStats.successfulCommands / redisStats.totalCommands) * 100
      )}%`,
    });

    throw error;
  }
};

// Redis utility functions with monitoring
const redisUtils = {
  // Basic operations
  async get(key: string): Promise<string | null> {
    return trackCommand("GET", key, async () => {
      const result = await redisClient.get(key);
      return result as string | null;
    });
  },

  async set(key: string, value: string, ttl?: number): Promise<boolean> {
    return trackCommand("SET", key, async () => {
      if (ttl) {
        await redisClient.setEx(key, ttl, value);
      } else {
        await redisClient.set(key, value);
      }
      return true;
    });
  },

  async del(key: string): Promise<boolean> {
    return trackCommand("DEL", key, async () => {
      const result = await redisClient.del(key);
      return Number(result) > 0;
    });
  },

  async exists(key: string): Promise<boolean> {
    return trackCommand("EXISTS", key, async () => {
      const result = await redisClient.exists(key);
      return result === 1;
    });
  },

  // JSON operations
  async getJson<T>(key: string): Promise<T | null> {
    try {
      const value = await redisClient.get(key);
      return value ? JSON.parse(value as string) : null;
    } catch (error) {
      console.error(`Redis GET JSON error for key ${key}:`, error);
      return null;
    }
  },

  async setJson(key: string, value: any, ttl?: number): Promise<boolean> {
    try {
      const jsonValue = JSON.stringify(value);
      return await this.set(key, jsonValue, ttl);
    } catch (error) {
      console.error(`Redis SET JSON error for key ${key}:`, error);
      return false;
    }
  },

  // Health check
  async healthCheck(): Promise<{
    status: string;
    latency?: number;
    error?: string;
  }> {
    try {
      const start = Date.now();
      await redisClient.ping();
      const latency = Date.now() - start;

      return {
        status: "healthy",
        latency: latency,
      };
    } catch (error) {
      return {
        status: "unhealthy",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },

  // Get comprehensive Redis statistics
  getStats() {
    const uptime = redisStats.lastConnectionTime
      ? Date.now() - redisStats.lastConnectionTime.getTime()
      : 0;

    const successRate =
      redisStats.totalCommands > 0
        ? (redisStats.successfulCommands / redisStats.totalCommands) * 100
        : 0;

    return {
      connection: {
        attempts: redisStats.connectionAttempts,
        successful: redisStats.successfulConnections,
        failed: redisStats.failedConnections,
        disconnections: redisStats.disconnections,
        lastConnection: redisStats.lastConnectionTime?.toISOString() || null,
        lastDisconnection:
          redisStats.lastDisconnectionTime?.toISOString() || null,
        uptime: uptime,
      },
      commands: {
        total: redisStats.totalCommands,
        successful: redisStats.successfulCommands,
        failed: redisStats.failedCommands,
        successRate: Math.round(successRate * 100) / 100,
        averageLatency: Math.round(redisStats.averageLatency * 100) / 100,
        latencyHistory: redisStats.latencyHistory.slice(-10), // Last 10 measurements
      },
      performance: {
        minLatency:
          redisStats.latencyHistory.length > 0
            ? Math.min(...redisStats.latencyHistory)
            : 0,
        maxLatency:
          redisStats.latencyHistory.length > 0
            ? Math.max(...redisStats.latencyHistory)
            : 0,
        p95Latency:
          redisStats.latencyHistory.length > 0
            ? redisStats.latencyHistory.sort((a, b) => a - b)[
                Math.floor(redisStats.latencyHistory.length * 0.95)
              ]
            : 0,
      },
    };
  },

  // Reset statistics
  resetStats() {
    redisStats.connectionAttempts = 0;
    redisStats.successfulConnections = 0;
    redisStats.failedConnections = 0;
    redisStats.disconnections = 0;
    redisStats.totalCommands = 0;
    redisStats.successfulCommands = 0;
    redisStats.failedCommands = 0;
    redisStats.averageLatency = 0;
    redisStats.latencyHistory = [];
    console.log("📊 Redis statistics reset");
  },

  // Batch operations
  async mget(keys: string[]): Promise<(string | null)[]> {
    try {
      const results = await redisClient.mGet(keys);
      return results.map((result) => result as string | null);
    } catch (error) {
      console.error("Redis MGET error:", error);
      return keys.map(() => null);
    }
  },

  async mset(keyValuePairs: Record<string, string>): Promise<boolean> {
    try {
      await redisClient.mSet(keyValuePairs);
      return true;
    } catch (error) {
      console.error("Redis MSET error:", error);
      return false;
    }
  },

  // Pattern operations
  async keys(pattern: string): Promise<string[]> {
    try {
      const results = await redisClient.keys(pattern);
      return results.map((result) => result as string);
    } catch (error) {
      console.error(`Redis KEYS error for pattern ${pattern}:`, error);
      return [];
    }
  },

  // TTL operations
  async ttl(key: string): Promise<number> {
    try {
      const result = await redisClient.ttl(key);
      return Number(result);
    } catch (error) {
      console.error(`Redis TTL error for key ${key}:`, error);
      return -1;
    }
  },

  async expire(key: string, seconds: number): Promise<boolean> {
    try {
      const result = await redisClient.expire(key, seconds);
      return Boolean(result);
    } catch (error) {
      console.error(`Redis EXPIRE error for key ${key}:`, error);
      return false;
    }
  },
};

// Export the client, connection function, and utilities
export { redisClient, connectRedis, redisUtils };
export default redisClient;
