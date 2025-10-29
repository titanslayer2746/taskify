import { Router } from "express";
import { executePlan } from "../controllers/executionController";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// All execution routes require authentication
router.use(authenticateToken);

// Execution endpoints
router.post("/", executePlan); // POST /api/execute

export default router;
