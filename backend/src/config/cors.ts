import cors from "cors";

// CORS configuration for different environments
const corsOptions = {
  // Development environment
  development: {
    origin: function (origin: string | undefined, callback: Function) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      const allowedOrigins = process.env.CORS_ORIGIN_DEV?.split(",") || [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:8080",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8080",
        "https://taskify-nu-three.vercel.app/",
      ];

      // For development, allow any localhost origin
      if (origin.includes("localhost") || origin.includes("127.0.0.1")) {
        return callback(null, true);
      }

      // TEMPORARY: Allow all origins in development for testing
      if (process.env.NODE_ENV === "development") {
        return callback(null, true);
      }

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.log(`CORS blocked origin: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
    ],
    exposedHeaders: ["Content-Range", "X-Content-Range"],
    maxAge: 86400, // 24 hours
  },

  // Production environment
  production: {
    origin: function (origin: string | undefined, callback: Function) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      const allowedOrigins = process.env.CORS_ORIGIN_PROD?.split(",") || [
        "https://taskify-nu-three.vercel.app",
        "https://taskify-nu-three.vercel.app/",
      ];

      console.log(`CORS check - Origin: ${origin}, Allowed: ${allowedOrigins}`);

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.log(`CORS blocked origin: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
    ],
    exposedHeaders: ["Content-Range", "X-Content-Range"],
    maxAge: 86400, // 24 hours
  },
};

// Get current environment
const getCurrentEnvironment = (): "development" | "production" => {
  return (
    (process.env.NODE_ENV as "development" | "production") || "development"
  );
};

// Export CORS middleware with environment-specific configuration
export const corsMiddleware = cors(corsOptions[getCurrentEnvironment()]);

// Export CORS options for reference
export const getCorsOptions = () => corsOptions[getCurrentEnvironment()];
