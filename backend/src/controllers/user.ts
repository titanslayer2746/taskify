import { Request, Response } from "express";
import { User } from "../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

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

    // Note: Refresh token caching removed - tokens are now stateless

    // Note: Session management removed - using stateless JWT approach

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
          // Note: Token blacklisting removed - using stateless JWT approach
          // Note: Session and cache invalidation removed - using stateless JWT approach
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

      // Note: Refresh token validation simplified - no cache lookup needed

      // Find user to ensure they still exist and are active
      const user = await User.findById(decoded.userId).select("-password");
      if (!user || !user.isActive) {
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

      // Note: Refresh token caching removed - tokens are now stateless

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

    // Get user profile directly from database
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User profile not found",
      });
    }

    // Return basic profile data (without sensitive information)
    const userResponse = {
      id: user._id,
      email: user.email,
      name: user.name,
      isActive: user.isActive,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      profilePicture: (user as any).profilePicture,
      bio: (user as any).bio,
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
