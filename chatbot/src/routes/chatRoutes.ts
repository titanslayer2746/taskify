import { Router } from "express";
import { sendMessage, submitAnswers } from "../controllers/chatController";
import { authenticateToken } from "../middleware/auth";
import { chatRateLimiter } from "../middleware/rateLimiter";

const router = Router();

// All chat routes require authentication and rate limiting
router.use(authenticateToken);
router.use(chatRateLimiter);

// Chat endpoints
router.post("/", sendMessage); // POST /api/chat
router.post("/answer", submitAnswers); // POST /api/chat/answer

export default router;
