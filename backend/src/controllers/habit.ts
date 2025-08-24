import { Request, Response } from "express";
import { Habit } from "../models/Habit";

// Helper function to calculate streak and total completions
const calculateHabitStats = (
  completions: Map<string, boolean>
): { streak: number; totalCompletions: number } => {
  const today = new Date().toISOString().split("T")[0];
  let streak = 0;
  let totalCompletions = 0;

  // Calculate total completions
  for (const [_, completed] of completions.entries()) {
    if (completed) {
      totalCompletions++;
    }
  }

  // Calculate current streak
  const dates = Array.from(completions.keys()).sort();
  const todayIndex = dates.indexOf(today);

  if (todayIndex !== -1) {
    for (let i = todayIndex; i >= 0; i--) {
      if (completions.get(dates[i])) {
        streak++;
      } else {
        break;
      }
    }
  }

  return { streak, totalCompletions };
};

// Helper function to create habit response
const createHabitResponse = (habit: any) => {
  const { streak, totalCompletions } = calculateHabitStats(habit.completions);

  return {
    id: habit._id,
    name: habit.name,
    description: habit.description || "",
    category: habit.category || "",
    frequency: habit.frequency || "daily",
    targetDays: habit.targetDays || 1,
    completions: Object.fromEntries(habit.completions.entries()),
    streak,
    totalCompletions,
    isActive: habit.isActive !== false, // Default to true
    createdAt: habit.createdAt,
    updatedAt: habit.updatedAt,
  };
};

// Create a new habit
export const createHabit = async (req: Request, res: Response) => {
  try {
    const { name, description, category, frequency, targetDays } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Habit name is required",
      });
    }

    if (name.trim().length > 50) {
      return res.status(400).json({
        success: false,
        message: "Habit name must be 50 characters or less",
      });
    }

    // Check if habit with same name already exists for this user
    const existingHabit = await Habit.findOne({
      userId,
      name: name.trim(),
    });

    if (existingHabit) {
      return res.status(400).json({
        success: false,
        message: "A habit with this name already exists",
      });
    }

    // Create new habit
    const newHabit = new Habit({
      name: name.trim(),
      description: description?.trim() || "",
      category: category?.trim() || "",
      frequency: frequency || "daily",
      targetDays: targetDays || 1,
      completions: {},
      userId,
      isActive: true,
    });

    await newHabit.save();

    const habitResponse = createHabitResponse(newHabit);

    res.status(201).json({
      success: true,
      message: "Habit created successfully",
      data: {
        habit: habitResponse,
      },
    });
  } catch (error) {
    console.error("Create habit error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get all habits for a user
export const getHabits = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const habits = await Habit.find({ userId }).sort({ createdAt: -1 });

    const habitsResponse = habits.map((habit) => createHabitResponse(habit));

    res.status(200).json({
      success: true,
      message: "Habits retrieved successfully",
      data: {
        habits: habitsResponse,
      },
    });
  } catch (error) {
    console.error("Get habits error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Toggle habit completion for a specific date
export const toggleCompletion = async (req: Request, res: Response) => {
  try {
    const { habitId } = req.params;
    const { date } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Validation
    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Date is required",
      });
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format. Use YYYY-MM-DD",
      });
    }

    // Find habit and ensure it belongs to the user
    const habit = await Habit.findOne({ _id: habitId, userId });
    if (!habit) {
      return res.status(404).json({
        success: false,
        message: "Habit not found",
      });
    }

    // Toggle completion for the date
    const currentCompletion = habit.completions.get(date) || false;
    habit.completions.set(date, !currentCompletion);

    await habit.save();

    const habitResponse = createHabitResponse(habit);

    res.status(200).json({
      success: true,
      message: "Habit completion toggled successfully",
      data: {
        habit: habitResponse,
      },
    });
  } catch (error) {
    console.error("Toggle completion error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Delete a habit
export const deleteHabit = async (req: Request, res: Response) => {
  try {
    const { habitId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Find habit and ensure it belongs to the user
    const habit = await Habit.findOne({ _id: habitId, userId });
    if (!habit) {
      return res.status(404).json({
        success: false,
        message: "Habit not found",
      });
    }

    await Habit.findByIdAndDelete(habitId);

    res.status(200).json({
      success: true,
      message: "Habit deleted successfully",
    });
  } catch (error) {
    console.error("Delete habit error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get a specific habit
export const getHabit = async (req: Request, res: Response) => {
  try {
    const { habitId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Find habit and ensure it belongs to the user
    const habit = await Habit.findOne({ _id: habitId, userId });
    if (!habit) {
      return res.status(404).json({
        success: false,
        message: "Habit not found",
      });
    }

    const habitResponse = createHabitResponse(habit);

    res.status(200).json({
      success: true,
      message: "Habit retrieved successfully",
      data: {
        habit: habitResponse,
      },
    });
  } catch (error) {
    console.error("Get habit error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
