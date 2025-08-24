import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { connectDB } from "./db/connection";
import apiRoutes from "./routes";
import { corsMiddleware } from "./config/cors";
import { corsErrorHandler } from "./middleware/cors-error-handler";

const app = express();
const PORT = process.env.PORT || 3001;

// Database connection
connectDB();

// Middleware
app.use(corsMiddleware);
app.use(express.json());

// API routes
app.use("/api", apiRoutes);

// Error handling middleware (must be after routes)
app.use(corsErrorHandler);

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "Habitty Backend Server is running!",
    api: "http://localhost:3001/api",
    health: "http://localhost:3001/api/health",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API Base URL: http://localhost:${PORT}/api`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
