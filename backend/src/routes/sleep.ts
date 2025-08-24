import { Router } from "express";
import {
  createSleepEntry,
  getSleepEntries,
  getSleepEntry,
  updateSleepEntry,
  deleteSleepEntry,
  getSleepStats,
} from "../controllers/sleep";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// All sleep routes require authentication
router.use(authenticateToken);

// Sleep entry CRUD routes
router.post("/", createSleepEntry); // Create new sleep entry
router.get("/", getSleepEntries); // Get all sleep entries (with optional sorting and limiting)
router.get("/stats", getSleepStats); // Get sleep statistics
router.get("/:entryId", getSleepEntry); // Get specific sleep entry
router.put("/:entryId", updateSleepEntry); // Update sleep entry
router.delete("/:entryId", deleteSleepEntry); // Delete sleep entry

export default router;
