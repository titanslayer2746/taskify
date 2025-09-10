import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { connectDB } from "./db/connection";
import { connectRedis } from "./config/redis";
import apiRoutes from "./routes";
import cors from "cors";
import { corsErrorHandler } from "./middleware/cors-error-handler";
import { sessionService } from "./services/sessionService";

const app = express();
const PORT = process.env.PORT || 3001;

// Database connection
connectDB();

// Redis connection
connectRedis();

app.use(
  cors({
    origin: [
      "https://taskify-nu-three.vercel.app", // your Vercel frontend URL
      "http://localhost:8080", // local development on port 8080
      "http://localhost:5173", // Vite default port
      "http://localhost:3000", // React default port
      "http://127.0.0.1:8080",
      "http://127.0.0.1:5173",
      "http://127.0.0.1:3000",
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

app.use(express.json());

// API routes
app.use("/api", apiRoutes);

// Error handling middleware (must be after routes)
app.use(corsErrorHandler);

// Root route
app.get("/", (req, res) => {
  const baseUrl =
    process.env.NODE_ENV === "production"
      ? `https://${req.get("host")}`
      : `http://localhost:${PORT}`;

  res.json({
    message: "Habitty Backend Server is running!",
    api: `${baseUrl}/api`,
    health: `${baseUrl}/api/health`,
    environment: process.env.NODE_ENV || "development",
    cors: {
      allowedOrigins: process.env.CORS_ORIGIN_PROD || "Not configured",
    },
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API Base URL: http://localhost:${PORT}/api`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);

  // Start session cleanup service (runs every 5 minutes)
  sessionService.startSessionCleanup(5);
  console.log(`🔄 Session cleanup service started (every 5 minutes)`);
});
