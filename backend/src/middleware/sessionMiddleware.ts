import { Request, Response, NextFunction } from "express";
import { sessionService, SessionData } from "../services/sessionService";

// Extend the Request interface to include session property
declare global {
  namespace Express {
    interface Request {
      session?: SessionData;
      sessionId?: string;
    }
  }
}

/**
 * Session middleware that manages user sessions
 */
export const sessionMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get session ID from Authorization header or session cookie
    let sessionId: string | undefined;

    // Try to get session ID from Authorization header (Bearer sessionId)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];

      // Check if it's a session ID (starts with 'sess_') or JWT token
      if (token.startsWith("sess_")) {
        sessionId = token;
      }
    }

    // Try to get session ID from session cookie
    if (!sessionId && req.cookies && req.cookies.sessionId) {
      sessionId = req.cookies.sessionId;
    }

    // Try to get session ID from custom header
    if (!sessionId && req.headers["x-session-id"]) {
      sessionId = req.headers["x-session-id"] as string;
    }

    if (sessionId) {
      // Get session data
      const sessionData = await sessionService.getSession(sessionId);

      if (sessionData) {
        // Check if session is still valid
        const now = Date.now();
        const timeSinceLastActivity = now - sessionData.lastActivity;
        const sessionTimeout = 30 * 60 * 1000; // 30 minutes

        if (timeSinceLastActivity <= sessionTimeout) {
          // Session is valid, attach to request
          req.session = sessionData;
          req.sessionId = sessionId;

          // Update session activity
          await sessionService.updateSessionActivity(
            sessionId,
            "api_request",
            req.path,
            {
              method: req.method,
              timestamp: now,
            }
          );

          console.log(
            `📊 SESSION ACTIVITY: Session ${sessionId} updated for user ${sessionData.userId}`
          );
        } else {
          // Session expired, clean it up
          await sessionService.invalidateSession(sessionId);
          console.log(
            `⏰ SESSION EXPIRED: Session ${sessionId} expired and invalidated`
          );
        }
      }
    }

    next();
  } catch (error) {
    console.error("Session middleware error:", error);
    // Continue without session data
    next();
  }
};

/**
 * Middleware to require active session
 */
export const requireSession = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.session) {
    return res.status(401).json({
      success: false,
      message: "Active session required",
      code: "SESSION_REQUIRED",
    });
  }

  next();
};

/**
 * Middleware to track specific user actions
 */
export const trackUserAction = (action: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.session) {
        await sessionService.updateSessionActivity(
          req.sessionId!,
          action,
          req.path,
          {
            method: req.method,
            timestamp: Date.now(),
            body: req.method !== "GET" ? req.body : undefined,
          }
        );
      }
      next();
    } catch (error) {
      console.error(`Error tracking user action ${action}:`, error);
      next();
    }
  };
};

/**
 * Middleware to extend session on activity
 */
export const extendSessionOnActivity = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.session && req.sessionId) {
      await sessionService.extendSession(req.sessionId);
    }
    next();
  } catch (error) {
    console.error("Error extending session:", error);
    next();
  }
};

/**
 * Middleware to get client information
 */
export const getClientInfo = (req: Request) => {
  const ipAddress =
    (req.headers["x-forwarded-for"] as string) ||
    (req.headers["x-real-ip"] as string) ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    "unknown";

  const userAgent = req.headers["user-agent"] || "unknown";

  // Parse device info from user agent
  const deviceInfo = parseUserAgent(userAgent);

  return {
    ipAddress: ipAddress.split(",")[0].trim(), // Get first IP if multiple
    userAgent,
    deviceInfo,
  };
};

/**
 * Parse user agent to extract device information
 */
function parseUserAgent(userAgent: string) {
  const deviceInfo: any = {};

  // Detect platform
  if (userAgent.includes("Windows")) {
    deviceInfo.platform = "Windows";
  } else if (userAgent.includes("Mac")) {
    deviceInfo.platform = "macOS";
  } else if (userAgent.includes("Linux")) {
    deviceInfo.platform = "Linux";
  } else if (userAgent.includes("Android")) {
    deviceInfo.platform = "Android";
  } else if (
    userAgent.includes("iOS") ||
    userAgent.includes("iPhone") ||
    userAgent.includes("iPad")
  ) {
    deviceInfo.platform = "iOS";
  }

  // Detect browser
  if (userAgent.includes("Chrome")) {
    deviceInfo.browser = "Chrome";
  } else if (userAgent.includes("Firefox")) {
    deviceInfo.browser = "Firefox";
  } else if (userAgent.includes("Safari")) {
    deviceInfo.browser = "Safari";
  } else if (userAgent.includes("Edge")) {
    deviceInfo.browser = "Edge";
  } else if (userAgent.includes("Opera")) {
    deviceInfo.browser = "Opera";
  }

  return deviceInfo;
}

/**
 * Middleware to create session on login
 */
export const createSessionOnLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // This middleware should be used after successful authentication
    if (req.user && !req.session) {
      const clientInfo = getClientInfo(req);

      const sessionData = await sessionService.createSession(
        req.user.userId,
        clientInfo.ipAddress,
        clientInfo.userAgent,
        clientInfo.deviceInfo
      );

      // Attach session to request
      req.session = sessionData;
      req.sessionId = sessionData.sessionId;

      // Add session ID to response headers for client to store
      res.setHeader("X-Session-ID", sessionData.sessionId);

      console.log(
        `🆕 LOGIN SESSION: Session created for user ${req.user.userId}`
      );
    }

    next();
  } catch (error) {
    console.error("Error creating session on login:", error);
    next();
  }
};

/**
 * Middleware to invalidate session on logout
 */
export const invalidateSessionOnLogout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.sessionId) {
      await sessionService.invalidateSession(req.sessionId);
      console.log(`🗑️ LOGOUT SESSION: Session ${req.sessionId} invalidated`);
    }

    // Clear session cookie if it exists
    res.clearCookie("sessionId");

    next();
  } catch (error) {
    console.error("Error invalidating session on logout:", error);
    next();
  }
};
