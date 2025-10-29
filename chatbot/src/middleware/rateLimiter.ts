import rateLimit from "express-rate-limit";

export const chatRateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "60000"), // 1 minute
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "30"), // 30 requests per window
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
