import { Router } from "express";
import {
  register,
  login,
  logout,
  refreshToken,
  getProfile,
  verifyOtp,
  resendOtp,
  forgotPassword,
  resetPassword,
} from "../controllers/user";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// User authentication routes
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh", refreshToken);
router.get("/profile", authenticateToken, getProfile);

// Email verification routes
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);

// Password reset routes
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
