import { Router } from "express";
import {
  getConversations,
  getConversation,
} from "../controllers/chatController";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// All conversation routes require authentication
router.use(authenticateToken);

// Conversation endpoints
router.get("/", getConversations); // GET /api/conversations
router.get("/:conversationId", getConversation); // GET /api/conversations/:conversationId

export default router;
