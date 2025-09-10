import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { redisUtils } from "../config/redis";

// Extend the Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
      };
    }
  }
}

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access token is required",
      });
    }

    // Check JWT token validation cache first
    const tokenHash = Buffer.from(token).toString("base64").slice(0, 16); // Use first 16 chars of base64 as hash
    const tokenCacheKey = `jwt:${tokenHash}`;
    const blacklistKey = `blacklist:${tokenHash}`;

    // First check if token is blacklisted
    try {
      const blacklistedToken = await redisUtils.getJson(blacklistKey);
      if (blacklistedToken) {
        console.log(
          `🚫 TOKEN BLACKLISTED: Token is in blacklist, access denied`
        );
        return res.status(401).json({
          success: false,
          message: "Token has been revoked",
        });
      }
    } catch (blacklistError) {
      console.warn(
        `⚠️ BLACKLIST CHECK ERROR: Failed to check token blacklist, proceeding with validation:`,
        blacklistError
      );
    }

    let decoded: { userId: string; email: string } | null = null;

    try {
      // Try to get cached JWT validation result
      const cachedTokenData = await redisUtils.getJson<{
        userId: string;
        email: string;
        valid: boolean;
        timestamp: number;
      }>(tokenCacheKey);

      if (cachedTokenData && cachedTokenData.valid) {
        console.log(
          `✅ JWT CACHE HIT: Token validation cached for user ${cachedTokenData.userId}`
        );
        decoded = {
          userId: cachedTokenData.userId,
          email: cachedTokenData.email,
        };
      }
    } catch (cacheError) {
      console.warn(
        `⚠️ JWT CACHE ERROR: Failed to read JWT cache, proceeding with validation:`,
        cacheError
      );
    }

    // If not in cache, verify JWT token
    if (!decoded) {
      console.log(`❌ JWT CACHE MISS: Token not in cache, verifying JWT`);

      try {
        decoded = jwt.verify(
          token,
          process.env.JWT_SECRET || "your-secret-key"
        ) as { userId: string; email: string };

        // Cache JWT validation result with dynamic TTL based on token expiration
        // Calculate remaining token lifetime for cache TTL
        const tokenExp = (decoded as any).exp;
        const currentTime = Math.floor(Date.now() / 1000);
        const remainingTime = tokenExp
          ? Math.max(tokenExp - currentTime, 60)
          : 60; // At least 1 minute

        try {
          await redisUtils.setJson(
            tokenCacheKey,
            {
              userId: decoded.userId,
              email: decoded.email,
              valid: true,
              timestamp: Date.now(),
              tokenExp: tokenExp,
              remainingTime: remainingTime,
            },
            Math.min(remainingTime, 300) // Cache for up to 5 minutes or remaining token time
          );
          console.log(
            `💾 JWT CACHED: Token validation cached for ${Math.min(
              remainingTime,
              300
            )} seconds`
          );
        } catch (cacheError) {
          console.warn(
            `⚠️ JWT CACHE WARNING: Failed to cache JWT validation:`,
            cacheError
          );
        }
      } catch (jwtError) {
        // Cache invalid JWT for 30 seconds to prevent repeated validation attempts
        try {
          await redisUtils.setJson(
            tokenCacheKey,
            {
              userId: "",
              email: "",
              valid: false,
              timestamp: Date.now(),
            },
            30
          );
        } catch (cacheError) {
          // Ignore cache errors for invalid tokens
        }

        if (jwtError instanceof jwt.JsonWebTokenError) {
          return res.status(401).json({
            success: false,
            message: "Invalid or expired token",
          });
        }

        if (jwtError instanceof jwt.TokenExpiredError) {
          return res.status(401).json({
            success: false,
            message: "Token has expired",
          });
        }

        throw jwtError;
      }
    }

    // Check Redis cache first with fallback to database
    const cacheKey = `user:${decoded.userId}`;
    let cachedUser: {
      userId: string;
      email: string;
      isActive: boolean;
      lastLogin: Date;
      name: string;
    } | null = null;

    try {
      cachedUser = await redisUtils.getJson<{
        userId: string;
        email: string;
        isActive: boolean;
        lastLogin: Date;
        name: string;
      }>(cacheKey);
    } catch (cacheError) {
      console.warn(
        `⚠️ CACHE ERROR: Failed to read from cache for user ${decoded.userId}, falling back to database:`,
        cacheError
      );
    }

    if (cachedUser) {
      console.log(`✅ CACHE HIT: User ${decoded.userId} found in cache`);

      // Check if user is still active
      if (!cachedUser.isActive) {
        return res.status(401).json({
          success: false,
          message: "Account is deactivated",
        });
      }

      // Add user info to request object from cache
      req.user = {
        userId: cachedUser.userId,
        email: cachedUser.email,
      };

      return next();
    }

    console.log(
      `❌ CACHE MISS: User ${decoded.userId} not in cache, checking database`
    );

    // If not in cache, check database
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Account is deactivated",
      });
    }

    // Cache user data for 5 minutes (300 seconds) with error handling
    const userData = {
      userId: user._id.toString(),
      email: user.email,
      isActive: user.isActive,
      lastLogin: user.lastLogin,
      name: user.name,
    };

    try {
      await redisUtils.setJson(cacheKey, userData, 300);
      console.log(
        `💾 CACHED: User ${decoded.userId} data cached for 5 minutes`
      );
    } catch (cacheError) {
      console.warn(
        `⚠️ CACHE WARNING: Failed to cache user ${decoded.userId} data, continuing without cache:`,
        cacheError
      );
      // Continue without caching - authentication still works
    }

    // Add user info to request object
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        message: "Token has expired",
      });
    }

    console.error("Authentication middleware error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Optional middleware for routes that can work with or without authentication
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (token) {
      // Check JWT token validation cache first (same logic as main auth)
      const tokenHash = Buffer.from(token).toString("base64").slice(0, 16);
      const tokenCacheKey = `jwt:${tokenHash}`;
      const blacklistKey = `blacklist:${tokenHash}`;

      // First check if token is blacklisted
      try {
        const blacklistedToken = await redisUtils.getJson(blacklistKey);
        if (blacklistedToken) {
          console.log(
            `🚫 TOKEN BLACKLISTED (Optional): Token is in blacklist, continuing without auth`
          );
          return next();
        }
      } catch (blacklistError) {
        console.warn(
          `⚠️ BLACKLIST CHECK ERROR (Optional): Failed to check token blacklist:`,
          blacklistError
        );
      }

      let decoded: { userId: string; email: string } | null = null;

      try {
        const cachedTokenData = await redisUtils.getJson<{
          userId: string;
          email: string;
          valid: boolean;
          timestamp: number;
        }>(tokenCacheKey);

        if (cachedTokenData && cachedTokenData.valid) {
          console.log(
            `✅ JWT CACHE HIT (Optional): Token validation cached for user ${cachedTokenData.userId}`
          );
          decoded = {
            userId: cachedTokenData.userId,
            email: cachedTokenData.email,
          };
        }
      } catch (cacheError) {
        console.warn(
          `⚠️ JWT CACHE ERROR (Optional): Failed to read JWT cache:`,
          cacheError
        );
      }

      // If not in cache, verify JWT token
      if (!decoded) {
        console.log(
          `❌ JWT CACHE MISS (Optional): Token not in cache, verifying JWT`
        );

        try {
          decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || "your-secret-key"
          ) as { userId: string; email: string };

          // Cache JWT validation result with dynamic TTL based on token expiration
          const tokenExp = (decoded as any).exp;
          const currentTime = Math.floor(Date.now() / 1000);
          const remainingTime = tokenExp
            ? Math.max(tokenExp - currentTime, 60)
            : 60; // At least 1 minute

          try {
            await redisUtils.setJson(
              tokenCacheKey,
              {
                userId: decoded.userId,
                email: decoded.email,
                valid: true,
                timestamp: Date.now(),
                tokenExp: tokenExp,
                remainingTime: remainingTime,
              },
              Math.min(remainingTime, 300) // Cache for up to 5 minutes or remaining token time
            );
            console.log(
              `💾 JWT CACHED (Optional): Token validation cached for ${Math.min(
                remainingTime,
                300
              )} seconds`
            );
          } catch (cacheError) {
            console.warn(
              `⚠️ JWT CACHE WARNING (Optional): Failed to cache JWT validation:`,
              cacheError
            );
          }
        } catch (jwtError) {
          // For optional auth, we just continue without user info on JWT errors
          console.log(
            `⚠️ JWT ERROR (Optional): Token validation failed, continuing without auth:`,
            jwtError instanceof Error ? jwtError.message : "Unknown error"
          );
          return next();
        }
      }

      // Check Redis cache first with fallback to database
      const cacheKey = `user:${decoded.userId}`;
      let cachedUser: {
        userId: string;
        email: string;
        isActive: boolean;
        lastLogin: Date;
        name: string;
      } | null = null;

      try {
        cachedUser = await redisUtils.getJson<{
          userId: string;
          email: string;
          isActive: boolean;
          lastLogin: Date;
          name: string;
        }>(cacheKey);
      } catch (cacheError) {
        console.warn(
          `⚠️ CACHE ERROR (Optional): Failed to read from cache for user ${decoded.userId}, falling back to database:`,
          cacheError
        );
      }

      if (cachedUser && cachedUser.isActive) {
        console.log(
          `✅ CACHE HIT (Optional): User ${decoded.userId} found in cache`
        );
        req.user = {
          userId: cachedUser.userId,
          email: cachedUser.email,
        };
      } else {
        console.log(
          `❌ CACHE MISS (Optional): User ${decoded.userId} not in cache, checking database`
        );

        // If not in cache, check database
        const user = await User.findById(decoded.userId).select("-password");
        if (user && user.isActive) {
          // Cache user data for 5 minutes with error handling
          const userData = {
            userId: user._id.toString(),
            email: user.email,
            isActive: user.isActive,
            lastLogin: user.lastLogin,
            name: user.name,
          };

          try {
            await redisUtils.setJson(cacheKey, userData, 300);
            console.log(
              `💾 CACHED (Optional): User ${decoded.userId} data cached for 5 minutes`
            );
          } catch (cacheError) {
            console.warn(
              `⚠️ CACHE WARNING (Optional): Failed to cache user ${decoded.userId} data:`,
              cacheError
            );
          }

          req.user = {
            userId: decoded.userId,
            email: decoded.email,
          };
        }
      }
    }

    next();
  } catch (error) {
    // For optional auth, we just continue without user info
    next();
  }
};

// Cache invalidation utilities
export const invalidateUserCache = async (userId: string) => {
  try {
    const cacheKey = `user:${userId}`;
    const deleted = await redisUtils.del(cacheKey);
    if (deleted) {
      console.log(`🗑️ CACHE INVALIDATED: User ${userId} cache cleared`);
    }
    return deleted;
  } catch (error) {
    console.error(`Error invalidating user cache for ${userId}:`, error);
    return false;
  }
};

// Invalidate cache for multiple users
export const invalidateMultipleUserCache = async (userIds: string[]) => {
  try {
    const cacheKeys = userIds.map((userId) => `user:${userId}`);
    const results = await Promise.all(
      cacheKeys.map((key) => redisUtils.del(key))
    );

    const deletedCount = results.filter(Boolean).length;
    console.log(
      `🗑️ CACHE INVALIDATED: ${deletedCount}/${userIds.length} user caches cleared`
    );

    return deletedCount;
  } catch (error) {
    console.error("Error invalidating multiple user caches:", error);
    return 0;
  }
};

// Clear all user caches (use with caution)
export const clearAllUserCaches = async () => {
  try {
    const userKeys = await redisUtils.keys("user:*");
    if (userKeys.length === 0) {
      console.log("No user caches found to clear");
      return 0;
    }

    const results = await Promise.all(
      userKeys.map((key) => redisUtils.del(key))
    );

    const deletedCount = results.filter(Boolean).length;
    console.log(`🗑️ CACHE CLEARED: ${deletedCount} user caches cleared`);

    return deletedCount;
  } catch (error) {
    console.error("Error clearing all user caches:", error);
    return 0;
  }
};

// JWT Token cache invalidation utilities
export const invalidateJWTTokenCache = async (token: string) => {
  try {
    const tokenHash = Buffer.from(token).toString("base64").slice(0, 16);
    const tokenCacheKey = `jwt:${tokenHash}`;
    const deleted = await redisUtils.del(tokenCacheKey);
    if (deleted) {
      console.log(`🗑️ JWT CACHE INVALIDATED: Token cache cleared`);
    }
    return deleted;
  } catch (error) {
    console.error(`Error invalidating JWT token cache:`, error);
    return false;
  }
};

// Clear all JWT token caches (useful for logout or token revocation)
export const clearAllJWTTokenCaches = async () => {
  try {
    const jwtKeys = await redisUtils.keys("jwt:*");
    if (jwtKeys.length === 0) {
      console.log("No JWT token caches found to clear");
      return 0;
    }

    const results = await Promise.all(
      jwtKeys.map((key) => redisUtils.del(key))
    );

    const deletedCount = results.filter(Boolean).length;
    console.log(
      `🗑️ JWT CACHE CLEARED: ${deletedCount} JWT token caches cleared`
    );

    return deletedCount;
  } catch (error) {
    console.error("Error clearing all JWT token caches:", error);
    return 0;
  }
};

// Clear all authentication caches (both user and JWT)
export const clearAllAuthCaches = async () => {
  try {
    const userCount = await clearAllUserCaches();
    const jwtCount = await clearAllJWTTokenCaches();

    console.log(
      `🗑️ ALL AUTH CACHES CLEARED: ${userCount} user caches + ${jwtCount} JWT caches`
    );

    return userCount + jwtCount;
  } catch (error) {
    console.error("Error clearing all authentication caches:", error);
    return 0;
  }
};

// Token blacklist management utilities
export const addTokenToBlacklist = async (token: string) => {
  try {
    const decoded = jwt.decode(token) as {
      userId: string;
      email: string;
      exp: number;
    } | null;

    if (!decoded) {
      console.warn(
        "⚠️ BLACKLIST WARNING: Cannot decode token for blacklisting"
      );
      return false;
    }

    const currentTime = Math.floor(Date.now() / 1000);
    const ttl = decoded.exp - currentTime;

    if (ttl <= 0) {
      console.log(
        "ℹ️ BLACKLIST INFO: Token already expired, no need to blacklist"
      );
      return true;
    }

    const tokenHash = Buffer.from(token).toString("base64").slice(0, 16);
    const blacklistKey = `blacklist:${tokenHash}`;

    const blacklistData = {
      userId: decoded.userId,
      email: decoded.email,
      blacklistedAt: Date.now(),
      expiresAt: decoded.exp * 1000,
    };

    await redisUtils.setJson(blacklistKey, blacklistData, ttl);
    console.log(
      `🚫 TOKEN BLACKLISTED: Token for user ${decoded.userId} added to blacklist for ${ttl} seconds`
    );

    return true;
  } catch (error) {
    console.error("Error adding token to blacklist:", error);
    return false;
  }
};

export const removeTokenFromBlacklist = async (token: string) => {
  try {
    const tokenHash = Buffer.from(token).toString("base64").slice(0, 16);
    const blacklistKey = `blacklist:${tokenHash}`;

    const deleted = await redisUtils.del(blacklistKey);
    if (deleted) {
      console.log(
        `✅ TOKEN REMOVED FROM BLACKLIST: Token removed from blacklist`
      );
    }

    return deleted;
  } catch (error) {
    console.error("Error removing token from blacklist:", error);
    return false;
  }
};

export const clearAllBlacklistedTokens = async () => {
  try {
    const blacklistKeys = await redisUtils.keys("blacklist:*");
    if (blacklistKeys.length === 0) {
      console.log("No blacklisted tokens found to clear");
      return 0;
    }

    const results = await Promise.all(
      blacklistKeys.map((key) => redisUtils.del(key))
    );

    const deletedCount = results.filter(Boolean).length;
    console.log(
      `🗑️ BLACKLIST CLEARED: ${deletedCount} blacklisted tokens cleared`
    );

    return deletedCount;
  } catch (error) {
    console.error("Error clearing all blacklisted tokens:", error);
    return 0;
  }
};

export const getBlacklistStats = async () => {
  try {
    const blacklistKeys = await redisUtils.keys("blacklist:*");
    const stats = {
      totalBlacklistedTokens: blacklistKeys.length,
      tokens: [] as Array<{
        key: string;
        ttl: number;
        data?: any;
      }>,
    };

    // Get TTL for each blacklisted token
    for (const key of blacklistKeys) {
      const ttl = await redisUtils.ttl(key);
      const data = await redisUtils.getJson(key);

      stats.tokens.push({
        key,
        ttl,
        data,
      });
    }

    return stats;
  } catch (error) {
    console.error("Error getting blacklist stats:", error);
    return {
      totalBlacklistedTokens: 0,
      tokens: [],
    };
  }
};

// Refresh token management utilities
export const invalidateRefreshToken = async (userId: string) => {
  try {
    const refreshCacheKey = `refresh:${userId}`;
    const deleted = await redisUtils.del(refreshCacheKey);
    if (deleted) {
      console.log(
        `🗑️ REFRESH TOKEN INVALIDATED: Refresh token cache cleared for user ${userId}`
      );
    }
    return deleted;
  } catch (error) {
    console.error(
      `Error invalidating refresh token for user ${userId}:`,
      error
    );
    return false;
  }
};

export const clearAllRefreshTokens = async () => {
  try {
    const refreshKeys = await redisUtils.keys("refresh:*");
    if (refreshKeys.length === 0) {
      console.log("No refresh tokens found to clear");
      return 0;
    }

    const results = await Promise.all(
      refreshKeys.map((key) => redisUtils.del(key))
    );

    const deletedCount = results.filter(Boolean).length;
    console.log(
      `🗑️ REFRESH TOKENS CLEARED: ${deletedCount} refresh tokens cleared`
    );

    return deletedCount;
  } catch (error) {
    console.error("Error clearing all refresh tokens:", error);
    return 0;
  }
};

export const getRefreshTokenStats = async () => {
  try {
    const refreshKeys = await redisUtils.keys("refresh:*");
    const stats = {
      totalRefreshTokens: refreshKeys.length,
      tokens: [] as Array<{
        key: string;
        ttl: number;
        data?: any;
      }>,
    };

    // Get TTL for each refresh token
    for (const key of refreshKeys) {
      const ttl = await redisUtils.ttl(key);
      const data = await redisUtils.getJson(key);

      stats.tokens.push({
        key,
        ttl,
        data,
      });
    }

    return stats;
  } catch (error) {
    console.error("Error getting refresh token stats:", error);
    return {
      totalRefreshTokens: 0,
      tokens: [],
    };
  }
};

// Enhanced cache clearing function that includes refresh tokens
export const clearAllAuthCachesEnhanced = async () => {
  try {
    const userCount = await clearAllUserCaches();
    const jwtCount = await clearAllJWTTokenCaches();
    const refreshCount = await clearAllRefreshTokens();
    const blacklistCount = await clearAllBlacklistedTokens();

    console.log(
      `🗑️ ALL AUTH CACHES CLEARED: ${userCount} user caches + ${jwtCount} JWT caches + ${refreshCount} refresh tokens + ${blacklistCount} blacklisted tokens`
    );

    return userCount + jwtCount + refreshCount + blacklistCount;
  } catch (error) {
    console.error("Error clearing all authentication caches:", error);
    return 0;
  }
};

// Comprehensive authentication statistics
export const getAuthStats = async () => {
  try {
    const [userStats, jwtStats, refreshStats, blacklistStats, redisStats] =
      await Promise.all([
        // Get user cache stats
        (async () => {
          const userKeys = await redisUtils.keys("user:*");
          return {
            totalUserCaches: userKeys.length,
            userCaches: await Promise.all(
              userKeys.map(async (key) => ({
                key,
                ttl: await redisUtils.ttl(key),
                data: await redisUtils.getJson(key),
              }))
            ),
          };
        })(),

        // Get JWT cache stats
        (async () => {
          const jwtKeys = await redisUtils.keys("jwt:*");
          return {
            totalJWTCaches: jwtKeys.length,
            jwtCaches: await Promise.all(
              jwtKeys.map(async (key) => ({
                key,
                ttl: await redisUtils.ttl(key),
                data: await redisUtils.getJson(key),
              }))
            ),
          };
        })(),

        // Get refresh token stats
        getRefreshTokenStats(),

        // Get blacklist stats
        getBlacklistStats(),

        // Get Redis performance stats
        redisUtils.getStats(),
      ]);

    return {
      timestamp: new Date().toISOString(),
      caches: {
        users: userStats,
        jwt: jwtStats,
        refresh: refreshStats,
        blacklist: blacklistStats,
      },
      redis: redisStats,
      summary: {
        totalCachedItems:
          userStats.totalUserCaches +
          jwtStats.totalJWTCaches +
          refreshStats.totalRefreshTokens +
          blacklistStats.totalBlacklistedTokens,
        activeUsers: userStats.totalUserCaches,
        activeTokens: jwtStats.totalJWTCaches,
        activeRefreshTokens: refreshStats.totalRefreshTokens,
        blacklistedTokens: blacklistStats.totalBlacklistedTokens,
      },
    };
  } catch (error) {
    console.error("Error getting authentication statistics:", error);
    return {
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Unknown error",
      caches: {
        users: { totalUserCaches: 0, userCaches: [] },
        jwt: { totalJWTCaches: 0, jwtCaches: [] },
        refresh: { totalRefreshTokens: 0, tokens: [] },
        blacklist: { totalBlacklistedTokens: 0, tokens: [] },
      },
      redis: { connection: {}, commands: {}, performance: {} },
      summary: {
        totalCachedItems: 0,
        activeUsers: 0,
        activeTokens: 0,
        activeRefreshTokens: 0,
        blacklistedTokens: 0,
      },
    };
  }
};
