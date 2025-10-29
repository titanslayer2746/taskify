import { Request, Response } from "express";
import { User } from "../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import {
  sendOtpVerification,
  sendPasswordReset,
} from "../services/emailService";
import { otpService } from "../services/otpService";

// OTP configuration
const OTP_CONFIG = {
  EXPIRY_MINUTES: 10,
  MAX_ATTEMPTS: 5,
};

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

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    // Password strength validation
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
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

    // Generate OTP for email verification
    const otp = otpService.generateOtp();
    const otpExpires = otpService.generateOtpExpiry();

    // Create new user (unverified by default)
    const newUser = new User({
      email: email.toLowerCase(),
      password: hashedPassword,
      name: name.trim(),
      isEmailVerified: false,
      otp,
      otpExpires,
      otpAttempts: 0,
      otpLastSent: new Date(),
    });

    await newUser.save();

    // Send OTP verification email
    const emailSent = await sendOtpVerification(
      newUser.email,
      newUser.name,
      otp
    );

    if (!emailSent) {
      // If email fails, clean up the user record
      await User.findByIdAndDelete(newUser._id);
      return res.status(500).json({
        success: false,
        message: "Failed to send verification email. Please try again.",
      });
    }

    // Return user data (without password) - no token until verified
    const userResponse = {
      id: newUser._id,
      email: newUser.email,
      name: newUser.name,
      isEmailVerified: newUser.isEmailVerified,
      createdAt: newUser.createdAt,
    };

    res.status(201).json({
      success: true,
      message:
        "Registration successful! Please check your email for OTP verification.",
      data: {
        user: userResponse,
        requiresVerification: true,
        otpExpiresIn: OTP_CONFIG.EXPIRY_MINUTES * 60, // in seconds
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

    // Check if email is verified
    if (!user.isEmailVerified) {
      // Generate new OTP for unverified user
      const newOtp = otpService.generateOtp();
      const otpExpires = otpService.generateOtpExpiry();

      // Update user with new OTP
      user.otp = newOtp;
      user.otpExpires = otpExpires;
      user.otpAttempts = 0; // Reset attempts
      user.otpLastSent = new Date();

      await user.save();

      // Send new OTP via email
      const emailSent = await sendOtpVerification(
        user.email,
        user.name,
        newOtp
      );

      if (!emailSent) {
        return res.status(500).json({
          success: false,
          message: "Failed to send verification email. Please try again.",
        });
      }

      // Return success response with verification required flag
      // This allows frontend to redirect without showing errors
      return res.status(200).json({
        success: true,
        message:
          "Please verify your email to continue. A new OTP has been sent to your email.",
        data: {
          requiresVerification: true,
          otpExpiresIn: OTP_CONFIG.EXPIRY_MINUTES * 60, // in seconds
          user: {
            id: user._id,
            email: user.email,
            name: user.name,
            isEmailVerified: user.isEmailVerified,
          },
        },
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

// Verify OTP for email verification
export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    // Validation
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    // Validate OTP format
    if (!otpService.isValidOtpFormat(otp)) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP format. OTP must be 6 digits.",
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if user is already verified
    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified",
      });
    }

    // Check if user has exceeded max OTP attempts
    if (otpService.hasExceededMaxAttempts(user.otpAttempts)) {
      return res.status(429).json({
        success: false,
        message: "Too many failed OTP attempts. Please request a new OTP.",
      });
    }

    // Check if OTP is expired
    if (otpService.isOtpExpired(user.otpExpires || new Date())) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new one.",
      });
    }

    // Verify OTP
    const isOtpValid =
      user.otp === otp && user.otpExpires && user.otpExpires > new Date();

    if (!isOtpValid) {
      // Increment failed attempts
      user.otpAttempts = otpService.incrementOtpAttempts(user.otpAttempts);
      await user.save();

      return res.status(400).json({
        success: false,
        message: "Invalid OTP. Please try again.",
        remainingAttempts: OTP_CONFIG.MAX_ATTEMPTS - user.otpAttempts,
      });
    }

    // OTP is valid - verify email and reset OTP fields
    user.isEmailVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    user.otpAttempts = 0;
    user.otpLastSent = undefined;

    await user.save();

    // Generate JWT token for verified user
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

    // Return user data with tokens
    const userResponse = {
      id: user._id,
      email: user.email,
      name: user.name,
      isEmailVerified: user.isEmailVerified,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };

    res.status(200).json({
      success: true,
      message: "Email verified successfully! Welcome to HabitTty.",
      data: {
        user: userResponse,
        token,
        refreshToken,
      },
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Resend OTP for email verification
export const resendOtp = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    // Validation
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if user is already verified
    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified",
      });
    }

    // Check rate limiting
    const rateLimitCheck = otpService.canRequestOtp(user.otpLastSent);
    if (!rateLimitCheck.canRequest) {
      return res.status(429).json({
        success: false,
        message: `Please wait ${rateLimitCheck.remainingTime} minute(s) before requesting a new OTP`,
      });
    }

    // Generate new OTP
    const newOtp = otpService.generateOtp();
    const otpExpires = otpService.generateOtpExpiry();

    // Update user with new OTP
    user.otp = newOtp;
    user.otpExpires = otpExpires;
    user.otpAttempts = 0; // Reset attempts
    user.otpLastSent = new Date();

    await user.save();

    // Send new OTP via email
    const emailSent = await sendOtpVerification(user.email, user.name, newOtp);

    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP. Please try again.",
      });
    }

    res.status(200).json({
      success: true,
      message: "New OTP sent successfully. Please check your email.",
      data: {
        otpExpiresIn: OTP_CONFIG.EXPIRY_MINUTES * 60, // in seconds
      },
    });
  } catch (error) {
    console.error("Resend OTP error:", error);
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
      isEmailVerified: user.isEmailVerified,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      profilePicture: user.profilePicture,
      bio: user.bio,
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

// Forgot password - send reset link
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    // Validation
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    // Always return success message (for security - don't reveal if email exists)
    if (!user) {
      return res.status(200).json({
        success: true,
        message:
          "If an account exists with this email, a password reset link has been sent.",
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Update user with reset token
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = resetTokenExpiry;
    await user.save();

    // Create reset URL with JWT token
    const resetLink = `${
      process.env.FRONTEND_URL || "http://localhost:8080"
    }/reset-password?token=${resetToken}`;

    // Send password reset email
    const emailSent = await sendPasswordReset(user.email, user.name, resetLink);

    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: "Failed to send password reset email. Please try again.",
      });
    }

    res.status(200).json({
      success: true,
      message:
        "If an account exists with this email, a password reset link has been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Reset password - validate token and update password
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, password, confirmPassword } = req.body;

    // Validation
    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Reset token is required",
      });
    }

    if (!password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password and confirm password are required",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    // Find user by reset token
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user password
    user.password = hashedPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.lastPasswordChange = new Date();
    await user.save();

    res.status(200).json({
      success: true,
      message:
        "Password has been reset successfully. Please login with your new password.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
