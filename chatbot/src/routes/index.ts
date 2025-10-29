import { Router } from "express";
import chatRoutes from "./chatRoutes";
import conversationRoutes from "./conversationRoutes";
import executionRoutes from "./executionRoutes";

const router = Router();

// Health check route
router.get("/health", (req, res) => {
  res.json({
    status: "OK",
    service: "Taskify AI Service",
    timestamp: new Date().toISOString(),
  });
});

// API version info
router.get("/", (req, res) => {
  res.json({
    name: "Taskify AI Service",
    version: "1.0.0",
    description: "AI-powered productivity automation service",
    endpoints: {
      health: "/health",
      chat: "/api/chat",
      conversations: "/api/conversations",
      execute: "/api/execute",
    },
  });
});

// Mount routes
router.use("/api/chat", chatRoutes);
router.use("/api/conversations", conversationRoutes);
router.use("/api/execute", executionRoutes);

export default router;
