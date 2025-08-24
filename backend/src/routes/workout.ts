import { Router } from "express";
import {
  createWorkoutPlan,
  getWorkoutPlans,
  getWorkoutPlan,
  updateWorkoutPlan,
  deleteWorkoutPlan,
  allocateExercisesToSchedule,
  // Workout entry controllers
  createWorkoutEntry,
  getWorkoutEntries,
  getWorkoutEntry,
  updateWorkoutEntry,
  deleteWorkoutEntry,
} from "../controllers/workout";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// All workout routes require authentication
router.use(authenticateToken);

// Workout plan CRUD routes
router.post("/", createWorkoutPlan); // Create new workout plan
router.get("/", getWorkoutPlans); // Get all workout plans (with optional sorting)
router.get("/:planId", getWorkoutPlan); // Get specific workout plan
router.put("/:planId", updateWorkoutPlan); // Update workout plan
router.delete("/:planId", deleteWorkoutPlan); // Delete workout plan

// Weekly schedule allocation route
router.patch("/:planId/schedule", allocateExercisesToSchedule); // Allocate exercises to weekly schedule

// Workout entry CRUD routes
router.post("/entries", createWorkoutEntry); // Create new workout entry
router.get("/entries", getWorkoutEntries); // Get all workout entries (with optional filtering)
router.get("/entries/:entryId", getWorkoutEntry); // Get specific workout entry
router.put("/entries/:entryId", updateWorkoutEntry); // Update workout entry
router.delete("/entries/:entryId", deleteWorkoutEntry); // Delete workout entry

export default router;
