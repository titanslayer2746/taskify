import { Router } from "express";
import {
  createJournalEntry,
  getJournalEntries,
  getJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,
  searchJournalEntries,
} from "../controllers/journal";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// All journal routes require authentication
router.use(authenticateToken);

// Journal CRUD routes
router.post("/", createJournalEntry); // Create new journal entry
router.get("/", getJournalEntries); // Get all journal entries (with optional search/tag filters)
router.get("/search", searchJournalEntries); // Search journal entries
router.get("/:entryId", getJournalEntry); // Get specific journal entry
router.put("/:entryId", updateJournalEntry); // Update journal entry
router.delete("/:entryId", deleteJournalEntry); // Delete journal entry

export default router;
