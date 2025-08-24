import { Router } from "express";
import userRoutes from "./user";
import habitRoutes from "./habit";
import todoRoutes from "./todo";
import journalRoutes from "./journal";
import financeRoutes from "./finance";
import workoutRoutes from "./workout";
import mealRoutes from "./meal";
import sleepRoutes from "./sleep";

const router = Router();

// Health check route
router.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    message: "Habitty API is running successfully!",
  });
});

// API version info
router.get("/", (req, res) => {
  res.json({
    name: "Habitty API",
    version: "1.0.0",
    description: "Comprehensive productivity and habit tracking API",
    endpoints: {
      health: "/api/health",
      users: "/api/users",
      habits: "/api/habits",
      todos: "/api/todos",
      journal: "/api/journal",
      finance: "/api/finance",
      workout: "/api/workout",
      meal: "/api/meal",
      sleep: "/api/sleep",
    },
  });
});

// User routes
router.use("/users", userRoutes);

// Habit routes
router.use("/habits", habitRoutes);

// Todo routes
router.use("/todos", todoRoutes);

// Journal routes
router.use("/journal", journalRoutes);

// Finance routes
router.use("/finance", financeRoutes);

// Workout routes
router.use("/workout", workoutRoutes);

// Meal routes
router.use("/meal", mealRoutes);

// Sleep routes
router.use("/sleep", sleepRoutes);

export default router;
