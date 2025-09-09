import { Router } from "express";
import {
  createSession,
  getCurrentSession,
  getUserSessions,
  invalidateSession,
  invalidateAllUserSessions,
  extendSession,
  getUserActivity,
  getSessionStats,
  cleanupExpiredSessions,
} from "../controllers/sessionController";
import { authenticateToken } from "../middleware/auth";
import {
  sessionMiddleware,
  requireSession,
  trackUserAction,
  extendSessionOnActivity,
} from "../middleware/sessionMiddleware";

const router = Router();

// Apply session middleware to all routes
router.use(sessionMiddleware);

// Session management routes
router.post("/create", authenticateToken, createSession);
router.get("/current", requireSession, getCurrentSession);
router.get("/user-sessions", authenticateToken, getUserSessions);
router.delete("/invalidate/:sessionId", authenticateToken, invalidateSession);
router.delete("/invalidate-all", authenticateToken, invalidateAllUserSessions);
router.post("/extend", extendSessionOnActivity, extendSession);

// Activity tracking routes
router.get("/activity", authenticateToken, getUserActivity);

// Admin/Statistics routes
router.get("/stats", authenticateToken, getSessionStats);
router.post("/cleanup", authenticateToken, cleanupExpiredSessions);

// Track specific actions
router.post(
  "/create",
  authenticateToken,
  trackUserAction("session_create"),
  createSession
);
router.get(
  "/current",
  requireSession,
  trackUserAction("session_view"),
  getCurrentSession
);
router.get(
  "/user-sessions",
  authenticateToken,
  trackUserAction("sessions_list"),
  getUserSessions
);
router.delete(
  "/invalidate/:sessionId",
  authenticateToken,
  trackUserAction("session_invalidate"),
  invalidateSession
);
router.delete(
  "/invalidate-all",
  authenticateToken,
  trackUserAction("sessions_invalidate_all"),
  invalidateAllUserSessions
);
router.post(
  "/extend",
  extendSessionOnActivity,
  trackUserAction("session_extend"),
  extendSession
);
router.get(
  "/activity",
  authenticateToken,
  trackUserAction("activity_view"),
  getUserActivity
);
router.get(
  "/stats",
  authenticateToken,
  trackUserAction("stats_view"),
  getSessionStats
);
router.post(
  "/cleanup",
  authenticateToken,
  trackUserAction("sessions_cleanup"),
  cleanupExpiredSessions
);

export default router;
