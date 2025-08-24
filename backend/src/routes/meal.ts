import { Router } from "express";
import {
  createDietPlan,
  getDietPlans,
  getDietPlan,
  updateDietPlan,
  deleteDietPlan,
} from "../controllers/meal";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// All meal routes require authentication
router.use(authenticateToken);

// Diet plan CRUD routes
router.post("/", createDietPlan); // Create new diet plan
router.get("/", getDietPlans); // Get all diet plans (with optional sorting)
router.get("/:planId", getDietPlan); // Get specific diet plan
router.put("/:planId", updateDietPlan); // Update diet plan
router.delete("/:planId", deleteDietPlan); // Delete diet plan

export default router;
