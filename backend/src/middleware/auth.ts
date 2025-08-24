import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User";

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

    // Verify JWT token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    ) as { userId: string; email: string };

    // Check if user still exists in database
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
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "your-secret-key"
      ) as { userId: string; email: string };

      const user = await User.findById(decoded.userId).select("-password");
      if (user && user.isActive) {
        req.user = {
          userId: decoded.userId,
          email: decoded.email,
        };
      }
    }

    next();
  } catch (error) {
    // For optional auth, we just continue without user info
    next();
  }
};
