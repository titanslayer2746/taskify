import { Router } from "express";
import userRoutes from "./user";
import habitRoutes from "./habit";
import todoRoutes from "./todo";
import journalRoutes from "./journal";
import financeRoutes from "./finance";
import workoutRoutes from "./workout";
import mealRoutes from "./meal";
import sleepRoutes from "./sleep";
import sessionRoutes from "./session";
import userProfileRoutes from "./userProfile";
import { redisUtils } from "../config/redis";
import { clearAllBlacklistedTokens } from "../middleware/auth";

const router = Router();

// Health check route
router.get("/health", async (req, res) => {
  try {
    const redisHealth = await redisUtils.healthCheck();

    res.json({
      status: "OK",
      timestamp: new Date().toISOString(),
      message: "Habitty API is running successfully!",
      services: {
        api: "healthy",
        redis: redisHealth,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "ERROR",
      timestamp: new Date().toISOString(),
      message: "Health check failed",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Redis health check route
router.get("/health/redis", async (req, res) => {
  try {
    const health = await redisUtils.healthCheck();
    res.json(health);
  } catch (error) {
    res.status(500).json({
      status: "unhealthy",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Redis monitoring and statistics route
router.get("/monitoring/redis", (req, res) => {
  try {
    const stats = redisUtils.getStats();
    res.json({
      timestamp: new Date().toISOString(),
      redis: stats,
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Reset Redis statistics route
router.post("/monitoring/redis/reset", (req, res) => {
  try {
    redisUtils.resetStats();
    res.json({
      message: "Redis statistics reset successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// API version info
router.get("/", (req, res) => {
  res.json({
    name: "Habitty API",
    version: "1.0.0",
    description: "Comprehensive productivity and habit tracking API",
    endpoints: {
      health: "/api/health",
      redisHealth: "/api/health/redis",
      monitoring: "/api/monitoring/redis",
      users: "/api/users",
      habits: "/api/habits",
      todos: "/api/todos",
      journal: "/api/journal",
      finance: "/api/finance",
      workout: "/api/workout",
      meal: "/api/meal",
      sleep: "/api/sleep",
      sessions: "/api/sessions",
      userProfile: "/api/user-profile",
    },
  });
});

// Temporary endpoint to clear blacklisted tokens
router.delete("/clear-blacklist", async (req, res) => {
  try {
    const clearedCount = await clearAllBlacklistedTokens();
    res.json({
      success: true,
      message: `Cleared ${clearedCount} blacklisted tokens`,
      clearedCount,
    });
  } catch (error) {
    console.error("Error clearing blacklist:", error);
    res.status(500).json({
      success: false,
      message: "Error clearing blacklist",
    });
  }
});

// User routes
router.use("/users", userRoutes);

// Habit routes
router.use("/habits", habitRoutes);

// Todo routes
router.use("/todos", todoRoutes);

// Journal routes
router.use("/journal", journalRoutes);

// Finance routes
router.use("/finance", financeRoutes);

// Workout routes
router.use("/workout", workoutRoutes);

// Meal routes
router.use("/meal", mealRoutes);

// Sleep routes
router.use("/sleep", sleepRoutes);

// Session routes
router.use("/sessions", sessionRoutes);

// User profile routes
router.use("/user-profile", userProfileRoutes);

export default router;
