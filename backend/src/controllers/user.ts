import { Request, Response } from "express";
import { User } from "../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { redisUtils } from "../config/redis";
import {
  invalidateJWTTokenCache,
  invalidateUserCache,
} from "../middleware/auth";
import { sessionService } from "../services/sessionService";
import { getClientInfo } from "../middleware/sessionMiddleware";
import { userProfileService } from "../services/userProfileService";

// Register user
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    // Validation
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: "Email, password, and name are required",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = new User({
      email: email.toLowerCase(),
      password: hashedPassword,
      name: name.trim(),
    });

    await newUser.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser._id, email: newUser.email },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" }
    );

    // Return user data (without password) and token
    const userResponse = {
      id: newUser._id,
      email: newUser.email,
      name: newUser.name,
      isActive: newUser.isActive,
      createdAt: newUser.createdAt,
    };

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: userResponse,
        token,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Login user
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Account is deactivated",
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" }
    );

    // Generate refresh token
    const refreshToken = jwt.sign(
      { userId: user._id, email: user.email, type: "refresh" },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "30d" }
    );

    // Cache refresh token for 30 days
    const refreshCacheKey = `refresh:${user._id}`;
    try {
      await redisUtils.setJson(
        refreshCacheKey,
        {
          userId: user._id.toString(),
          email: user.email,
          tokenHash: Buffer.from(refreshToken).toString("base64").slice(0, 16),
          createdAt: Date.now(),
        },
        30 * 24 * 60 * 60 // 30 days in seconds
      );
      console.log(
        `💾 REFRESH TOKEN CACHED: Refresh token cached for user ${user._id}`
      );
    } catch (cacheError) {
      console.warn(
        `⚠️ REFRESH TOKEN CACHE WARNING: Failed to cache refresh token:`,
        cacheError
      );
    }

    // Create session for the user
    try {
      const clientInfo = getClientInfo(req);
      const sessionData = await sessionService.createSession(
        user._id.toString(),
        clientInfo.ipAddress,
        clientInfo.userAgent,
        clientInfo.deviceInfo
      );

      console.log(`🆕 LOGIN SESSION: Session created for user ${user._id}`);

      // Add session ID to response headers
      res.setHeader("X-Session-ID", sessionData.sessionId);
    } catch (sessionError) {
      console.warn(
        `⚠️ SESSION CREATION WARNING: Failed to create session:`,
        sessionError
      );
      // Continue without session - login still works
    }

    // Return user data (without password) and token
    const userResponse = {
      id: user._id,
      email: user.email,
      name: user.name,
      isActive: user.isActive,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
    };

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: userResponse,
        token,
        refreshToken,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Logout user with token blacklisting
export const logout = async (req: Request, res: Response) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (token) {
      try {
        // Decode token to get expiration time
        const decoded = jwt.decode(token) as {
          userId: string;
          email: string;
          exp: number;
        } | null;

        if (decoded) {
          // Calculate TTL for blacklist (time until token expires)
          const currentTime = Math.floor(Date.now() / 1000);
          const ttl = decoded.exp - currentTime;

          if (ttl > 0) {
            // Add token to blacklist with TTL equal to remaining token lifetime
            const tokenHash = Buffer.from(token)
              .toString("base64")
              .slice(0, 16);
            const blacklistKey = `blacklist:${tokenHash}`;

            await redisUtils.setJson(
              blacklistKey,
              {
                userId: decoded.userId,
                email: decoded.email,
                blacklistedAt: Date.now(),
                expiresAt: decoded.exp * 1000, // Convert to milliseconds
              },
              ttl
            );

            console.log(
              `🚫 TOKEN BLACKLISTED: Token for user ${decoded.userId} added to blacklist for ${ttl} seconds`
            );
          }

          // Invalidate JWT cache, user cache, and refresh token cache
          await invalidateJWTTokenCache(token);
          await invalidateUserCache(decoded.userId);

          // Clear refresh token cache
          const refreshCacheKey = `refresh:${decoded.userId}`;
          try {
            await redisUtils.del(refreshCacheKey);
            console.log(
              `🗑️ REFRESH TOKEN CLEARED: Refresh token cache cleared for user ${decoded.userId}`
            );
          } catch (refreshError) {
            console.warn(
              `⚠️ REFRESH TOKEN CLEAR WARNING: Failed to clear refresh token cache:`,
              refreshError
            );
          }

          // Invalidate all user sessions
          try {
            const invalidatedSessions =
              await sessionService.invalidateUserSessions(decoded.userId);
            console.log(
              `🗑️ USER SESSIONS CLEARED: ${invalidatedSessions} sessions invalidated for user ${decoded.userId}`
            );
          } catch (sessionError) {
            console.warn(
              `⚠️ SESSION CLEAR WARNING: Failed to clear user sessions:`,
              sessionError
            );
          }

          // Invalidate all user profile caches
          try {
            const invalidatedProfileCaches =
              await userProfileService.invalidateAllUserCaches(decoded.userId);
            console.log(
              `🗑️ USER PROFILE CACHES CLEARED: ${invalidatedProfileCaches} profile caches invalidated for user ${decoded.userId}`
            );
          } catch (profileError) {
            console.warn(
              `⚠️ PROFILE CACHE CLEAR WARNING: Failed to clear user profile caches:`,
              profileError
            );
          }

          console.log(
            `🗑️ CACHE INVALIDATED: Cleared caches for user ${decoded.userId} during logout`
          );
        }
      } catch (tokenError) {
        console.warn(
          "⚠️ LOGOUT WARNING: Failed to process token during logout:",
          tokenError
        );
        // Continue with logout even if token processing fails
      }
    }

    res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Refresh access token using refresh token
export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: "Refresh token is required",
      });
    }

    try {
      // Verify refresh token
      const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_SECRET || "your-secret-key"
      ) as { userId: string; email: string; type: string };

      // Check if it's actually a refresh token
      if (decoded.type !== "refresh") {
        return res.status(401).json({
          success: false,
          message: "Invalid refresh token",
        });
      }

      // Check if refresh token exists in cache
      const refreshCacheKey = `refresh:${decoded.userId}`;
      const cachedRefreshToken = await redisUtils.getJson<{
        userId: string;
        email: string;
        tokenHash: string;
        createdAt: number;
      }>(refreshCacheKey);

      if (!cachedRefreshToken) {
        return res.status(401).json({
          success: false,
          message: "Refresh token not found or expired",
        });
      }

      // Verify the token hash matches
      const tokenHash = Buffer.from(refreshToken)
        .toString("base64")
        .slice(0, 16);
      if (cachedRefreshToken.tokenHash !== tokenHash) {
        return res.status(401).json({
          success: false,
          message: "Invalid refresh token",
        });
      }

      // Find user to ensure they still exist and are active
      const user = await User.findById(decoded.userId).select("-password");
      if (!user || !user.isActive) {
        // Remove invalid refresh token from cache
        await redisUtils.del(refreshCacheKey);
        return res.status(401).json({
          success: false,
          message: "User not found or deactivated",
        });
      }

      // Generate new access token
      const newToken = jwt.sign(
        { userId: user._id, email: user.email },
        process.env.JWT_SECRET || "your-secret-key",
        { expiresIn: "7d" }
      );

      // Generate new refresh token
      const newRefreshToken = jwt.sign(
        { userId: user._id, email: user.email, type: "refresh" },
        process.env.JWT_SECRET || "your-secret-key",
        { expiresIn: "30d" }
      );

      // Update refresh token cache
      try {
        await redisUtils.setJson(
          refreshCacheKey,
          {
            userId: user._id.toString(),
            email: user.email,
            tokenHash: Buffer.from(newRefreshToken)
              .toString("base64")
              .slice(0, 16),
            createdAt: Date.now(),
          },
          30 * 24 * 60 * 60 // 30 days in seconds
        );
        console.log(
          `🔄 REFRESH TOKEN UPDATED: New refresh token cached for user ${user._id}`
        );
      } catch (cacheError) {
        console.warn(
          `⚠️ REFRESH TOKEN CACHE WARNING: Failed to update refresh token cache:`,
          cacheError
        );
      }

      // Return new tokens
      res.status(200).json({
        success: true,
        message: "Token refreshed successfully",
        data: {
          token: newToken,
          refreshToken: newRefreshToken,
        },
      });
    } catch (jwtError) {
      if (jwtError instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({
          success: false,
          message: "Invalid refresh token",
        });
      }

      if (jwtError instanceof jwt.TokenExpiredError) {
        return res.status(401).json({
          success: false,
          message: "Refresh token has expired",
        });
      }

      throw jwtError;
    }
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get current user profile
export const getProfile = async (req: Request, res: Response) => {
  try {
    // This endpoint is protected by authentication middleware
    // req.user is set by the middleware
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Get user profile from cache service
    const profileData = await userProfileService.getUserProfile(
      req.user.userId
    );

    if (!profileData) {
      return res.status(404).json({
        success: false,
        message: "User profile not found",
      });
    }

    // Return basic profile data (without sensitive information)
    const userResponse = {
      id: profileData.userId,
      email: profileData.email,
      name: profileData.name,
      isActive: profileData.isActive,
      lastLogin: profileData.lastLogin,
      createdAt: profileData.createdAt,
      updatedAt: profileData.updatedAt,
      profilePicture: profileData.profilePicture,
      bio: profileData.bio,
    };

    res.status(200).json({
      success: true,
      message: "Profile retrieved successfully",
      data: {
        user: userResponse,
      },
    });
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
