import { Router } from "express";
import {
  createProject,
  deleteProject,
  getProject,
  getProjects,
  importProjects,
  updateProject,
} from "../controllers/project";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// All project routes require authentication
router.use(authenticateToken);

router.get("/", getProjects); // List the user's projects
router.post("/", createProject); // Create a project
router.post("/import", importProjects); // Bulk import (browser-only projects)
router.get("/:projectId", getProject); // Get one project
router.put("/:projectId", updateProject); // Update fields
router.delete("/:projectId", deleteProject); // Delete a project

export default router;
