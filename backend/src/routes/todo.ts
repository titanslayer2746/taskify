import { Router } from "express";
import {
  createTodo,
  getTodos,
  getTodo,
  toggleTodo,
  editTodo,
  deleteTodo,
} from "../controllers/todo";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// All todo routes require authentication
router.use(authenticateToken);

// Todo CRUD routes
router.post("/", createTodo); // Create new todo
router.get("/", getTodos); // Get all todos for user
router.get("/:todoId", getTodo); // Get specific todo
router.patch("/:todoId/toggle", toggleTodo); // Toggle completion
router.put("/:todoId", editTodo); // Edit todo
router.delete("/:todoId", deleteTodo); // Delete todo

export default router;
