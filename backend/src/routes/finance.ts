import { Router } from "express";
import {
  createFinanceEntry,
  getFinanceEntries,
  getFinanceEntry,
  updateFinanceEntry,
  deleteFinanceEntry,
  getFinanceStats,
} from "../controllers/finance";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// All finance routes require authentication
router.use(authenticateToken);

// Finance CRUD routes
router.post("/", createFinanceEntry); // Create new finance entry
router.get("/", getFinanceEntries); // Get all finance entries (with optional filters)
router.get("/stats", getFinanceStats); // Get finance statistics
router.get("/:entryId", getFinanceEntry); // Get specific finance entry
router.put("/:entryId", updateFinanceEntry); // Update finance entry
router.delete("/:entryId", deleteFinanceEntry); // Delete finance entry

export default router;
