import { Router } from "express";
import {
  getUserProfile,
  updateUserProfile,
  getUserPreferences,
  updateUserPreferences,
  getUserSettings,
  updateUserSettings,
  getUserStatistics,
  invalidateUserProfileCache,
  invalidateAllUserCaches,
  getCacheStats,
  clearAllUserProfileCaches,
} from "../controllers/userProfileController";
import { authenticateToken } from "../middleware/auth";
import {
  sessionMiddleware,
  trackUserAction,
} from "../middleware/sessionMiddleware";

const router = Router();

// Apply session middleware to all routes
router.use(sessionMiddleware);

// User profile routes
router.get(
  "/profile",
  authenticateToken,
  trackUserAction("profile_view"),
  getUserProfile
);
router.put(
  "/profile",
  authenticateToken,
  trackUserAction("profile_update"),
  updateUserProfile
);

// User preferences routes
router.get(
  "/preferences",
  authenticateToken,
  trackUserAction("preferences_view"),
  getUserPreferences
);
router.put(
  "/preferences",
  authenticateToken,
  trackUserAction("preferences_update"),
  updateUserPreferences
);

// User settings routes
router.get(
  "/settings",
  authenticateToken,
  trackUserAction("settings_view"),
  getUserSettings
);
router.put(
  "/settings",
  authenticateToken,
  trackUserAction("settings_update"),
  updateUserSettings
);

// User statistics routes
router.get(
  "/statistics",
  authenticateToken,
  trackUserAction("statistics_view"),
  getUserStatistics
);

// Cache management routes
router.delete(
  "/cache/profile",
  authenticateToken,
  trackUserAction("profile_cache_invalidate"),
  invalidateUserProfileCache
);
router.delete(
  "/cache/all",
  authenticateToken,
  trackUserAction("all_caches_invalidate"),
  invalidateAllUserCaches
);

// Admin/Statistics routes
router.get(
  "/cache/stats",
  authenticateToken,
  trackUserAction("cache_stats_view"),
  getCacheStats
);
router.delete(
  "/cache/clear-all",
  authenticateToken,
  trackUserAction("cache_clear_all"),
  clearAllUserProfileCaches
);

export default router;
