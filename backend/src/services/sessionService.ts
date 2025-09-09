import { redisUtils } from "../config/redis";
import { User } from "../models/User";

// Session data interface
export interface SessionData {
  userId: string;
  email: string;
  name: string;
  isActive: boolean;
  lastActivity: number;
  loginTime: number;
  ipAddress?: string;
  userAgent?: string;
  deviceInfo?: {
    platform?: string;
    browser?: string;
    version?: string;
  };
  activityCount: number;
  sessionId: string;
}

// User activity tracking interface
export interface UserActivity {
  timestamp: number;
  action: string;
  endpoint?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

// Session statistics interface
export interface SessionStats {
  totalSessions: number;
  activeSessions: number;
  expiredSessions: number;
  averageSessionDuration: number;
  mostActiveUsers: Array<{
    userId: string;
    email: string;
    sessionCount: number;
    totalActivity: number;
  }>;
}

class SessionService {
  private readonly SESSION_PREFIX = "session:";
  private readonly ACTIVITY_PREFIX = "activity:";
  private readonly USER_SESSIONS_PREFIX = "user_sessions:";
  private readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds
  private readonly ACTIVITY_RETENTION_DAYS = 7; // Keep activity data for 7 days

  /**
   * Create a new user session
   */
  async createSession(
    userId: string,
    ipAddress?: string,
    userAgent?: string,
    deviceInfo?: any
  ): Promise<SessionData> {
    try {
      // Get user data
      const user = await User.findById(userId).select("-password");
      if (!user) {
        throw new Error("User not found");
      }

      const sessionId = this.generateSessionId();
      const now = Date.now();

      const sessionData: SessionData = {
        userId: user._id.toString(),
        email: user.email,
        name: user.name,
        isActive: user.isActive,
        lastActivity: now,
        loginTime: now,
        ipAddress,
        userAgent,
        deviceInfo,
        activityCount: 0,
        sessionId,
      };

      // Cache session data
      const sessionKey = `${this.SESSION_PREFIX}${sessionId}`;
      await redisUtils.setJson(
        sessionKey,
        sessionData,
        this.SESSION_TIMEOUT / 1000
      );

      // Track user sessions
      const userSessionsKey = `${this.USER_SESSIONS_PREFIX}${userId}`;
      const existingSessions =
        (await redisUtils.getJson<string[]>(userSessionsKey)) || [];
      existingSessions.push(sessionId);

      // Keep only last 5 sessions per user
      const recentSessions = existingSessions.slice(-5);
      await redisUtils.setJson(
        userSessionsKey,
        recentSessions,
        this.SESSION_TIMEOUT / 1000
      );

      // Log session creation
      console.log(
        `🆕 SESSION CREATED: Session ${sessionId} created for user ${userId}`
      );

      return sessionData;
    } catch (error) {
      console.error("Error creating session:", error);
      throw error;
    }
  }

  /**
   * Get session data by session ID
   */
  async getSession(sessionId: string): Promise<SessionData | null> {
    try {
      const sessionKey = `${this.SESSION_PREFIX}${sessionId}`;
      const sessionData = await redisUtils.getJson<SessionData>(sessionKey);

      if (sessionData) {
        console.log(
          `📖 SESSION RETRIEVED: Session ${sessionId} found for user ${sessionData.userId}`
        );
      }

      return sessionData;
    } catch (error) {
      console.error(`Error getting session ${sessionId}:`, error);
      return null;
    }
  }

  /**
   * Update session activity
   */
  async updateSessionActivity(
    sessionId: string,
    action: string,
    endpoint?: string,
    metadata?: Record<string, any>
  ): Promise<boolean> {
    try {
      const sessionKey = `${this.SESSION_PREFIX}${sessionId}`;
      const sessionData = await redisUtils.getJson<SessionData>(sessionKey);

      if (!sessionData) {
        console.warn(
          `⚠️ SESSION NOT FOUND: Session ${sessionId} not found for activity update`
        );
        return false;
      }

      // Update session data
      sessionData.lastActivity = Date.now();
      sessionData.activityCount += 1;

      // Save updated session
      await redisUtils.setJson(
        sessionKey,
        sessionData,
        this.SESSION_TIMEOUT / 1000
      );

      // Track activity
      await this.trackActivity(sessionData.userId, {
        timestamp: Date.now(),
        action,
        endpoint,
        ipAddress: sessionData.ipAddress,
        userAgent: sessionData.userAgent,
        metadata,
      });

      console.log(
        `📊 ACTIVITY UPDATED: Session ${sessionId} activity updated - ${action}`
      );
      return true;
    } catch (error) {
      console.error(`Error updating session activity for ${sessionId}:`, error);
      return false;
    }
  }

  /**
   * Track user activity
   */
  async trackActivity(userId: string, activity: UserActivity): Promise<void> {
    try {
      const activityKey = `${this.ACTIVITY_PREFIX}${userId}:${Date.now()}`;
      await redisUtils.setJson(
        activityKey,
        activity,
        this.ACTIVITY_RETENTION_DAYS * 24 * 60 * 60 // 7 days in seconds
      );

      // Also maintain a recent activity list for quick access
      const recentActivityKey = `${this.ACTIVITY_PREFIX}recent:${userId}`;
      const recentActivities =
        (await redisUtils.getJson<UserActivity[]>(recentActivityKey)) || [];

      recentActivities.push(activity);

      // Keep only last 50 activities
      const trimmedActivities = recentActivities.slice(-50);
      await redisUtils.setJson(
        recentActivityKey,
        trimmedActivities,
        this.ACTIVITY_RETENTION_DAYS * 24 * 60 * 60
      );
    } catch (error) {
      console.error(`Error tracking activity for user ${userId}:`, error);
    }
  }

  /**
   * Get user's recent activities
   */
  async getUserActivities(
    userId: string,
    limit: number = 20
  ): Promise<UserActivity[]> {
    try {
      const recentActivityKey = `${this.ACTIVITY_PREFIX}recent:${userId}`;
      const activities =
        (await redisUtils.getJson<UserActivity[]>(recentActivityKey)) || [];

      return activities.slice(-limit);
    } catch (error) {
      console.error(`Error getting activities for user ${userId}:`, error);
      return [];
    }
  }

  /**
   * Extend session timeout
   */
  async extendSession(sessionId: string): Promise<boolean> {
    try {
      const sessionKey = `${this.SESSION_PREFIX}${sessionId}`;
      const sessionData = await redisUtils.getJson<SessionData>(sessionKey);

      if (!sessionData) {
        return false;
      }

      // Update last activity and extend TTL
      sessionData.lastActivity = Date.now();
      await redisUtils.setJson(
        sessionKey,
        sessionData,
        this.SESSION_TIMEOUT / 1000
      );

      console.log(`⏰ SESSION EXTENDED: Session ${sessionId} timeout extended`);
      return true;
    } catch (error) {
      console.error(`Error extending session ${sessionId}:`, error);
      return false;
    }
  }

  /**
   * Invalidate session
   */
  async invalidateSession(sessionId: string): Promise<boolean> {
    try {
      const sessionKey = `${this.SESSION_PREFIX}${sessionId}`;
      const sessionData = await redisUtils.getJson<SessionData>(sessionKey);

      if (sessionData) {
        // Remove from user sessions list
        const userSessionsKey = `${this.USER_SESSIONS_PREFIX}${sessionData.userId}`;
        const userSessions =
          (await redisUtils.getJson<string[]>(userSessionsKey)) || [];
        const updatedSessions = userSessions.filter((id) => id !== sessionId);

        if (updatedSessions.length > 0) {
          await redisUtils.setJson(
            userSessionsKey,
            updatedSessions,
            this.SESSION_TIMEOUT / 1000
          );
        } else {
          await redisUtils.del(userSessionsKey);
        }
      }

      // Delete session
      const deleted = await redisUtils.del(sessionKey);

      if (deleted) {
        console.log(`🗑️ SESSION INVALIDATED: Session ${sessionId} invalidated`);
      }

      return deleted;
    } catch (error) {
      console.error(`Error invalidating session ${sessionId}:`, error);
      return false;
    }
  }

  /**
   * Invalidate all sessions for a user
   */
  async invalidateUserSessions(userId: string): Promise<number> {
    try {
      const userSessionsKey = `${this.USER_SESSIONS_PREFIX}${userId}`;
      const userSessions =
        (await redisUtils.getJson<string[]>(userSessionsKey)) || [];

      let invalidatedCount = 0;
      for (const sessionId of userSessions) {
        if (await this.invalidateSession(sessionId)) {
          invalidatedCount++;
        }
      }

      // Clear user sessions list
      await redisUtils.del(userSessionsKey);

      console.log(
        `🗑️ USER SESSIONS INVALIDATED: ${invalidatedCount} sessions invalidated for user ${userId}`
      );
      return invalidatedCount;
    } catch (error) {
      console.error(`Error invalidating sessions for user ${userId}:`, error);
      return 0;
    }
  }

  /**
   * Clean up expired sessions
   */
  async cleanupExpiredSessions(): Promise<number> {
    try {
      const sessionKeys = await redisUtils.keys(`${this.SESSION_PREFIX}*`);
      let cleanedCount = 0;

      for (const key of sessionKeys) {
        const sessionData = await redisUtils.getJson<SessionData>(key);

        if (sessionData) {
          const now = Date.now();
          const timeSinceLastActivity = now - sessionData.lastActivity;

          // If session is older than timeout, clean it up
          if (timeSinceLastActivity > this.SESSION_TIMEOUT) {
            await this.invalidateSession(sessionData.sessionId);
            cleanedCount++;
          }
        }
      }

      console.log(
        `🧹 SESSION CLEANUP: ${cleanedCount} expired sessions cleaned up`
      );
      return cleanedCount;
    } catch (error) {
      console.error("Error cleaning up expired sessions:", error);
      return 0;
    }
  }

  /**
   * Get session statistics
   */
  async getSessionStats(): Promise<SessionStats> {
    try {
      const sessionKeys = await redisUtils.keys(`${this.SESSION_PREFIX}*`);
      const userSessionKeys = await redisUtils.keys(
        `${this.USER_SESSIONS_PREFIX}*`
      );

      let totalSessions = 0;
      let activeSessions = 0;
      let expiredSessions = 0;
      let totalSessionDuration = 0;
      const userActivityMap = new Map<
        string,
        { sessionCount: number; totalActivity: number; email: string }
      >();

      // Analyze all sessions
      for (const key of sessionKeys) {
        const sessionData = await redisUtils.getJson<SessionData>(key);

        if (sessionData) {
          totalSessions++;

          const now = Date.now();
          const timeSinceLastActivity = now - sessionData.lastActivity;
          const sessionDuration = now - sessionData.loginTime;

          if (timeSinceLastActivity <= this.SESSION_TIMEOUT) {
            activeSessions++;
            totalSessionDuration += sessionDuration;
          } else {
            expiredSessions++;
          }

          // Track user activity
          const userId = sessionData.userId;
          const existing = userActivityMap.get(userId) || {
            sessionCount: 0,
            totalActivity: 0,
            email: sessionData.email,
          };
          existing.sessionCount++;
          existing.totalActivity += sessionData.activityCount;
          userActivityMap.set(userId, existing);
        }
      }

      // Get most active users
      const mostActiveUsers = Array.from(userActivityMap.entries())
        .map(([userId, data]) => ({
          userId,
          email: data.email,
          sessionCount: data.sessionCount,
          totalActivity: data.totalActivity,
        }))
        .sort((a, b) => b.totalActivity - a.totalActivity)
        .slice(0, 10);

      const averageSessionDuration =
        activeSessions > 0 ? totalSessionDuration / activeSessions : 0;

      return {
        totalSessions,
        activeSessions,
        expiredSessions,
        averageSessionDuration,
        mostActiveUsers,
      };
    } catch (error) {
      console.error("Error getting session statistics:", error);
      return {
        totalSessions: 0,
        activeSessions: 0,
        expiredSessions: 0,
        averageSessionDuration: 0,
        mostActiveUsers: [],
      };
    }
  }

  /**
   * Get all active sessions for a user
   */
  async getUserActiveSessions(userId: string): Promise<SessionData[]> {
    try {
      const userSessionsKey = `${this.USER_SESSIONS_PREFIX}${userId}`;
      const userSessions =
        (await redisUtils.getJson<string[]>(userSessionsKey)) || [];

      const activeSessions: SessionData[] = [];

      for (const sessionId of userSessions) {
        const sessionData = await this.getSession(sessionId);
        if (sessionData) {
          const now = Date.now();
          const timeSinceLastActivity = now - sessionData.lastActivity;

          if (timeSinceLastActivity <= this.SESSION_TIMEOUT) {
            activeSessions.push(sessionData);
          }
        }
      }

      return activeSessions;
    } catch (error) {
      console.error(`Error getting active sessions for user ${userId}:`, error);
      return [];
    }
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 15);
    return `sess_${timestamp}_${randomPart}`;
  }

  /**
   * Start periodic session cleanup
   */
  startSessionCleanup(intervalMinutes: number = 5): void {
    setInterval(async () => {
      try {
        await this.cleanupExpiredSessions();
      } catch (error) {
        console.error("Error in periodic session cleanup:", error);
      }
    }, intervalMinutes * 60 * 1000);

    console.log(
      `🔄 SESSION CLEANUP STARTED: Cleanup scheduled every ${intervalMinutes} minutes`
    );
  }
}

// Export singleton instance
export const sessionService = new SessionService();
export default sessionService;
