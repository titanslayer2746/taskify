import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { connectDB } from "./db/connection";
import apiRoutes from "./routes";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3001;

// Database connection
connectDB();

// CORS configuration
const corsOrigins = process.env.CORS_ORIGINS?.split(",");

app.use(
  cors({
    origin: corsOrigins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

app.use(express.json());

// API routes
app.use("/api", apiRoutes);

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
});
