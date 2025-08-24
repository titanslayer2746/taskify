import { Router } from "express";
import {
  createHabit,
  getHabits,
  getHabit,
  toggleCompletion,
  deleteHabit,
} from "../controllers/habit";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// All habit routes require authentication
router.use(authenticateToken);

// Habit CRUD routes
router.post("/", createHabit); // Create new habit
router.get("/", getHabits); // Get all habits for user
router.get("/:habitId", getHabit); // Get specific habit
router.patch("/:habitId/toggle", toggleCompletion); // Toggle completion for a date
router.delete("/:habitId", deleteHabit); // Delete habit

export default router;
