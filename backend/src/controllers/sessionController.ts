import { Request, Response } from "express";
import { sessionService } from "../services/sessionService";
import { getClientInfo } from "../middleware/sessionMiddleware";

/**
 * Create a new session (typically called after login)
 */
export const createSession = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required to create session",
      });
    }

    const clientInfo = getClientInfo(req);

    const sessionData = await sessionService.createSession(
      req.user.userId,
      clientInfo.ipAddress,
      clientInfo.userAgent,
      clientInfo.deviceInfo
    );

    res.status(201).json({
      success: true,
      message: "Session created successfully",
      data: {
        sessionId: sessionData.sessionId,
        sessionData: {
          userId: sessionData.userId,
          email: sessionData.email,
          name: sessionData.name,
          loginTime: sessionData.loginTime,
          lastActivity: sessionData.lastActivity,
          deviceInfo: sessionData.deviceInfo,
        },
      },
    });
  } catch (error) {
    console.error("Error creating session:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Get current session information
 */
export const getCurrentSession = async (req: Request, res: Response) => {
  try {
    if (!req.session) {
      return res.status(404).json({
        success: false,
        message: "No active session found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Session retrieved successfully",
      data: {
        session: {
          sessionId: req.session.sessionId,
          userId: req.session.userId,
          email: req.session.email,
          name: req.session.name,
          loginTime: req.session.loginTime,
          lastActivity: req.session.lastActivity,
          activityCount: req.session.activityCount,
          deviceInfo: req.session.deviceInfo,
          ipAddress: req.session.ipAddress,
        },
      },
    });
  } catch (error) {
    console.error("Error getting current session:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Get all active sessions for the current user
 */
export const getUserSessions = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const activeSessions = await sessionService.getUserActiveSessions(
      req.user.userId
    );

    res.status(200).json({
      success: true,
      message: "User sessions retrieved successfully",
      data: {
        sessions: activeSessions.map((session) => ({
          sessionId: session.sessionId,
          loginTime: session.loginTime,
          lastActivity: session.lastActivity,
          activityCount: session.activityCount,
          deviceInfo: session.deviceInfo,
          ipAddress: session.ipAddress,
          isCurrent: session.sessionId === req.sessionId,
        })),
        totalSessions: activeSessions.length,
      },
    });
  } catch (error) {
    console.error("Error getting user sessions:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Invalidate a specific session
 */
export const invalidateSession = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: "Session ID is required",
      });
    }

    // Check if user owns this session
    if (req.user) {
      const userSessions = await sessionService.getUserActiveSessions(
        req.user.userId
      );
      const sessionExists = userSessions.some(
        (session) => session.sessionId === sessionId
      );

      if (!sessionExists) {
        return res.status(403).json({
          success: false,
          message: "You can only invalidate your own sessions",
        });
      }
    }

    const success = await sessionService.invalidateSession(sessionId);

    if (success) {
      res.status(200).json({
        success: true,
        message: "Session invalidated successfully",
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }
  } catch (error) {
    console.error("Error invalidating session:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Invalidate all sessions for the current user
 */
export const invalidateAllUserSessions = async (
  req: Request,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const invalidatedCount = await sessionService.invalidateUserSessions(
      req.user.userId
    );

    res.status(200).json({
      success: true,
      message: "All user sessions invalidated successfully",
      data: {
        invalidatedSessions: invalidatedCount,
      },
    });
  } catch (error) {
    console.error("Error invalidating all user sessions:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Extend current session
 */
export const extendSession = async (req: Request, res: Response) => {
  try {
    if (!req.sessionId) {
      return res.status(404).json({
        success: false,
        message: "No active session to extend",
      });
    }

    const success = await sessionService.extendSession(req.sessionId);

    if (success) {
      res.status(200).json({
        success: true,
        message: "Session extended successfully",
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }
  } catch (error) {
    console.error("Error extending session:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Get user activity history
 */
export const getUserActivity = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const limit = parseInt(req.query.limit as string) || 20;
    const activities = await sessionService.getUserActivities(
      req.user.userId,
      limit
    );

    res.status(200).json({
      success: true,
      message: "User activity retrieved successfully",
      data: {
        activities: activities.map((activity) => ({
          timestamp: activity.timestamp,
          action: activity.action,
          endpoint: activity.endpoint,
          ipAddress: activity.ipAddress,
          metadata: activity.metadata,
        })),
        totalActivities: activities.length,
      },
    });
  } catch (error) {
    console.error("Error getting user activity:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Get session statistics (admin only)
 */
export const getSessionStats = async (req: Request, res: Response) => {
  try {
    // In a real application, you'd check if the user has admin privileges
    // For now, we'll allow any authenticated user to see stats

    const stats = await sessionService.getSessionStats();

    res.status(200).json({
      success: true,
      message: "Session statistics retrieved successfully",
      data: {
        stats: {
          totalSessions: stats.totalSessions,
          activeSessions: stats.activeSessions,
          expiredSessions: stats.expiredSessions,
          averageSessionDuration: Math.round(stats.averageSessionDuration),
          mostActiveUsers: stats.mostActiveUsers,
        },
      },
    });
  } catch (error) {
    console.error("Error getting session statistics:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Clean up expired sessions (admin only)
 */
export const cleanupExpiredSessions = async (req: Request, res: Response) => {
  try {
    // In a real application, you'd check if the user has admin privileges

    const cleanedCount = await sessionService.cleanupExpiredSessions();

    res.status(200).json({
      success: true,
      message: "Expired sessions cleaned up successfully",
      data: {
        cleanedSessions: cleanedCount,
      },
    });
  } catch (error) {
    console.error("Error cleaning up expired sessions:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
