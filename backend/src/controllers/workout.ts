import { Request, Response } from "express";
import { WorkoutPlan, WorkoutEntry } from "../models/Workout";

interface ExerciseInput {
  id?: string;
  name: string;
  sets: number;
  reps?: number;
  duration?: number;
  notes?: string;
}

interface SortQuery {
  [key: string]: 1 | -1;
}

// Create a new workout plan
export const createWorkoutPlan = async (req: Request, res: Response) => {
  try {
    const { name, description, exercises, weeklySchedule, duration } = req.body;
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
        message: "Plan name is required",
      });
    }

    if (name.trim().length > 100) {
      return res.status(400).json({
        success: false,
        message: "Plan name must be 100 characters or less",
      });
    }

    if (description && description.trim().length > 500) {
      return res.status(400).json({
        success: false,
        message: "Description must be 500 characters or less",
      });
    }

    if (!exercises || !Array.isArray(exercises) || exercises.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one exercise is required",
      });
    }

    // Validate exercises
    for (const exercise of exercises) {
      if (!exercise.name || !exercise.name.trim()) {
        return res.status(400).json({
          success: false,
          message: "All exercises must have a name",
        });
      }

      if (exercise.name.trim().length > 100) {
        return res.status(400).json({
          success: false,
          message: "Exercise names must be 100 characters or less",
        });
      }

      if (!exercise.sets || exercise.sets < 1 || exercise.sets > 50) {
        return res.status(400).json({
          success: false,
          message: "Exercise sets must be between 1 and 50",
        });
      }

      // Check reps only if duration is not provided or is 0
      if (
        (!exercise.duration || exercise.duration === 0) &&
        (!exercise.reps || exercise.reps < 1 || exercise.reps > 1000)
      ) {
        return res.status(400).json({
          success: false,
          message: "Exercise reps must be between 1 and 1000",
        });
      }

      if (
        exercise.duration !== undefined &&
        exercise.duration !== null &&
        exercise.duration !== 0 &&
        (exercise.duration < 1 || exercise.duration > 300)
      ) {
        return res.status(400).json({
          success: false,
          message: "Exercise duration must be between 1 and 300 minutes",
        });
      }

      if (exercise.notes && exercise.notes.trim().length > 500) {
        return res.status(400).json({
          success: false,
          message: "Exercise notes must be 500 characters or less",
        });
      }
    }

    // Set default empty weekly schedule if not provided
    const defaultWeeklySchedule = {
      sunday: [],
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
    };

    // Use provided weekly schedule or default empty one
    const finalWeeklySchedule = weeklySchedule || defaultWeeklySchedule;

    // Validate weekly schedule structure if provided
    if (weeklySchedule) {
      const requiredDays = [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
      ];
      for (const day of requiredDays) {
        if (
          !Array.isArray(weeklySchedule[day as keyof typeof weeklySchedule])
        ) {
          return res.status(400).json({
            success: false,
            message: `Invalid weekly schedule format for ${day}`,
          });
        }
      }
    }

    // Validate duration
    if (!duration || duration < 1 || duration > 52) {
      return res.status(400).json({
        success: false,
        message: "Duration must be between 1 and 52 weeks",
      });
    }

    // Generate random IDs for all exercises if they don't have IDs
    const exercisesWithIds = exercises.map(
      (exercise: ExerciseInput, index: number) => ({
        id:
          exercise.id ||
          `ex_${Date.now()}_${index}_${Math.random()
            .toString(36)
            .substring(2, 8)}`,
        name: exercise.name.trim(),
        sets: exercise.sets,
        reps: exercise.reps,
        duration:
          exercise.duration && exercise.duration > 0
            ? exercise.duration
            : undefined,
        notes: exercise.notes?.trim() || "",
      })
    );

    // Create new workout plan
    const newPlan = new WorkoutPlan({
      name: name.trim(),
      description: description?.trim() || "",
      exercises: exercisesWithIds as any,
      weeklySchedule: finalWeeklySchedule,
      duration,
      userId,
    });

    await newPlan.save();

    const planResponse = {
      id: (newPlan._id as any).toString(),
      name: newPlan.name,
      description: newPlan.description,
      exercises: newPlan.exercises,
      weeklySchedule: newPlan.weeklySchedule,
      duration: newPlan.duration,
      createdAt: newPlan.createdAt.toISOString(),
      updatedAt: newPlan.updatedAt.toISOString(),
    };

    res.status(201).json({
      success: true,
      message: "Workout plan created successfully",
      data: {
        plan: planResponse,
      },
    });
  } catch (error) {
    console.error("Create workout plan error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get all workout plans for a user
export const getWorkoutPlans = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { sortBy, sortOrder } = req.query;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Build sort object
    let sort: SortQuery = { createdAt: -1 }; // Default sort
    if (sortBy && typeof sortBy === "string") {
      const validSortFields = ["name", "duration", "createdAt"];
      if (validSortFields.includes(sortBy)) {
        sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };
      }
    }

    const plans = await WorkoutPlan.find({ userId }).sort(sort).select("-__v");

    const plansResponse = plans.map((plan) => ({
      id: (plan._id as any).toString(),
      name: plan.name,
      description: plan.description,
      exercises: plan.exercises,
      weeklySchedule: plan.weeklySchedule,
      duration: plan.duration,
      createdAt: plan.createdAt.toISOString(),
      updatedAt: plan.updatedAt.toISOString(),
    }));

    res.status(200).json({
      success: true,
      message: "Workout plans retrieved successfully",
      data: {
        plans: plansResponse,
      },
    });
  } catch (error) {
    console.error("Get workout plans error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get a specific workout plan
export const getWorkoutPlan = async (req: Request, res: Response) => {
  try {
    const { planId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Find plan and ensure it belongs to the user
    const plan = await WorkoutPlan.findOne({ _id: planId, userId });
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Workout plan not found",
      });
    }

    const planResponse = {
      id: (plan._id as any).toString(),
      name: plan.name,
      description: plan.description,
      exercises: plan.exercises,
      weeklySchedule: plan.weeklySchedule,
      duration: plan.duration,
      createdAt: plan.createdAt.toISOString(),
      updatedAt: plan.updatedAt.toISOString(),
    };

    res.status(200).json({
      success: true,
      message: "Workout plan retrieved successfully",
      data: {
        plan: planResponse,
      },
    });
  } catch (error) {
    console.error("Get workout plan error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Update a workout plan
export const updateWorkoutPlan = async (req: Request, res: Response) => {
  try {
    const { planId } = req.params;
    const { name, description, exercises, weeklySchedule, duration } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Find plan and ensure it belongs to the user
    const plan = await WorkoutPlan.findOne({ _id: planId, userId });
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Workout plan not found",
      });
    }

    // Validation and updates
    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({
          success: false,
          message: "Plan name cannot be empty",
        });
      }
      if (name.trim().length > 100) {
        return res.status(400).json({
          success: false,
          message: "Plan name must be 100 characters or less",
        });
      }
      plan.name = name.trim();
    }

    if (description !== undefined) {
      if (description.trim().length > 500) {
        return res.status(400).json({
          success: false,
          message: "Description must be 500 characters or less",
        });
      }
      plan.description = description.trim();
    }

    if (exercises !== undefined) {
      if (!Array.isArray(exercises) || exercises.length === 0) {
        return res.status(400).json({
          success: false,
          message: "At least one exercise is required",
        });
      }

      // Validate exercises
      for (const exercise of exercises) {
        if (!exercise.name || !exercise.name.trim()) {
          return res.status(400).json({
            success: false,
            message: "All exercises must have a name",
          });
        }

        if (exercise.name.trim().length > 100) {
          return res.status(400).json({
            success: false,
            message: "Exercise names must be 100 characters or less",
          });
        }

        if (!exercise.sets || exercise.sets < 1 || exercise.sets > 50) {
          return res.status(400).json({
            success: false,
            message: "Exercise sets must be between 1 and 50",
          });
        }

        // Check reps only if duration is not provided or is 0
        if (
          (!exercise.duration || exercise.duration === 0) &&
          (!exercise.reps || exercise.reps < 1 || exercise.reps > 1000)
        ) {
          return res.status(400).json({
            success: false,
            message: "Exercise reps must be between 1 and 1000",
          });
        }

        if (
          exercise.duration !== undefined &&
          exercise.duration !== null &&
          exercise.duration !== 0 &&
          (exercise.duration < 1 || exercise.duration > 300)
        ) {
          return res.status(400).json({
            success: false,
            message: "Exercise duration must be between 1 and 300 minutes",
          });
        }

        if (exercise.notes && exercise.notes.trim().length > 500) {
          return res.status(400).json({
            success: false,
            message: "Exercise notes must be 500 characters or less",
          });
        }
      }

      // Generate random IDs for all exercises if they don't have IDs
      const exercisesWithIds = exercises.map(
        (exercise: ExerciseInput, index: number) => ({
          id:
            exercise.id ||
            `ex_${Date.now()}_${index}_${Math.random()
              .toString(36)
              .substring(2, 8)}`,
          name: exercise.name.trim(),
          sets: exercise.sets,
          reps: exercise.reps,
          duration:
            exercise.duration && exercise.duration > 0
              ? exercise.duration
              : undefined,
          notes: exercise.notes?.trim() || "",
        })
      );

      plan.exercises = exercisesWithIds as any;
    }

    if (weeklySchedule !== undefined) {
      const requiredDays = [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
      ];

      // Validate each day has an array
      for (const day of requiredDays) {
        if (
          !Array.isArray(weeklySchedule[day as keyof typeof weeklySchedule])
        ) {
          return res.status(400).json({
            success: false,
            message: `Invalid weekly schedule format for ${day}`,
          });
        }
      }

      // Get all exercise IDs from the current plan (including existing ones if exercises aren't being updated)
      const availableExerciseIds = plan.exercises.map(
        (exercise: any) => exercise.id
      );

      // Validate that all exercise IDs in the schedule exist in the plan
      for (const day of requiredDays) {
        const dayExercises = weeklySchedule[day as keyof typeof weeklySchedule];
        for (const exerciseId of dayExercises) {
          if (!availableExerciseIds.includes(exerciseId)) {
            return res.status(400).json({
              success: false,
              message: `Exercise ID '${exerciseId}' not found in plan for ${day}`,
            });
          }
        }
      }

      plan.weeklySchedule = weeklySchedule;
    }

    if (duration !== undefined) {
      if (duration < 1 || duration > 52) {
        return res.status(400).json({
          success: false,
          message: "Duration must be between 1 and 52 weeks",
        });
      }
      plan.duration = duration;
    }

    await plan.save();

    const planResponse = {
      id: (plan._id as any).toString(),
      name: plan.name,
      description: plan.description,
      exercises: plan.exercises,
      weeklySchedule: plan.weeklySchedule,
      duration: plan.duration,
      createdAt: plan.createdAt.toISOString(),
      updatedAt: plan.updatedAt.toISOString(),
    };

    res.status(200).json({
      success: true,
      message: "Workout plan updated successfully",
      data: {
        plan: planResponse,
      },
    });
  } catch (error) {
    console.error("Update workout plan error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Delete a workout plan
export const deleteWorkoutPlan = async (req: Request, res: Response) => {
  try {
    const { planId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Find plan and ensure it belongs to the user
    const plan = await WorkoutPlan.findOne({ _id: planId, userId });
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Workout plan not found",
      });
    }

    await WorkoutPlan.findByIdAndDelete(planId);

    res.status(200).json({
      success: true,
      message: "Workout plan deleted successfully",
    });
  } catch (error) {
    console.error("Delete workout plan error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Allocate exercises to weekly schedule
export const allocateExercisesToSchedule = async (
  req: Request,
  res: Response
) => {
  try {
    const { planId } = req.params;
    const { weeklySchedule } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Find plan and ensure it belongs to the user
    const plan = await WorkoutPlan.findOne({ _id: planId, userId });
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Workout plan not found",
      });
    }

    // Validate weekly schedule
    if (!weeklySchedule) {
      return res.status(400).json({
        success: false,
        message: "Weekly schedule is required",
      });
    }

    const requiredDays = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];

    // Validate each day has an array
    for (const day of requiredDays) {
      if (!Array.isArray(weeklySchedule[day as keyof typeof weeklySchedule])) {
        return res.status(400).json({
          success: false,
          message: `Invalid weekly schedule format for ${day}`,
        });
      }
    }

    // Get all exercise IDs from the plan
    const availableExerciseIds = plan.exercises.map(
      (exercise: any) => exercise.id
    );

    // Validate that all exercise IDs in the schedule exist in the plan
    for (const day of requiredDays) {
      const dayExercises = weeklySchedule[day as keyof typeof weeklySchedule];
      for (const exerciseId of dayExercises) {
        if (!availableExerciseIds.includes(exerciseId)) {
          return res.status(400).json({
            success: false,
            message: `Exercise ID '${exerciseId}' not found in plan for ${day}`,
          });
        }
      }
    }

    // Update the weekly schedule
    plan.weeklySchedule = weeklySchedule;
    await plan.save();

    const planResponse = {
      id: (plan._id as any).toString(),
      name: plan.name,
      description: plan.description,
      exercises: plan.exercises,
      weeklySchedule: plan.weeklySchedule,
      duration: plan.duration,
      createdAt: plan.createdAt.toISOString(),
      updatedAt: plan.updatedAt.toISOString(),
    };

    res.status(200).json({
      success: true,
      message: "Weekly schedule updated successfully",
      data: {
        plan: planResponse,
      },
    });
  } catch (error) {
    console.error("Allocate exercises to schedule error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ==================== WORKOUT ENTRIES ====================

// Create a new workout entry
export const createWorkoutEntry = async (req: Request, res: Response) => {
  try {
    const {
      date,
      type,
      category,
      duration,
      intensity,
      calories,
      distance,
      sets,
      notes,
      location,
    } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Validation
    if (!date || !date.trim()) {
      return res.status(400).json({
        success: false,
        message: "Date is required",
      });
    }

    if (!type || !type.trim()) {
      return res.status(400).json({
        success: false,
        message: "Workout type is required",
      });
    }

    if (type.trim().length > 100) {
      return res.status(400).json({
        success: false,
        message: "Workout type must be 100 characters or less",
      });
    }

    if (
      !category ||
      !["cardio", "strength", "flexibility", "sports", "other"].includes(
        category
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid category is required",
      });
    }

    if (!duration || duration < 1 || duration > 1440) {
      return res.status(400).json({
        success: false,
        message: "Duration must be between 1 and 1440 minutes",
      });
    }

    if (!intensity || !["low", "medium", "high"].includes(intensity)) {
      return res.status(400).json({
        success: false,
        message: "Valid intensity is required",
      });
    }

    if (calories && (calories < 0 || calories > 10000)) {
      return res.status(400).json({
        success: false,
        message: "Calories must be between 0 and 10000",
      });
    }

    if (distance && (distance < 0 || distance > 1000000)) {
      return res.status(400).json({
        success: false,
        message: "Distance must be between 0 and 1000000 meters",
      });
    }

    if (sets && Array.isArray(sets)) {
      for (const set of sets) {
        if (!set.exercise || !set.exercise.trim()) {
          return res.status(400).json({
            success: false,
            message: "All sets must have an exercise name",
          });
        }

        if (set.exercise.trim().length > 100) {
          return res.status(400).json({
            success: false,
            message: "Exercise names must be 100 characters or less",
          });
        }

        if (set.reps && (set.reps < 1 || set.reps > 10000)) {
          return res.status(400).json({
            success: false,
            message: "Reps must be between 1 and 10000",
          });
        }

        if (set.weight && (set.weight < 0 || set.weight > 10000)) {
          return res.status(400).json({
            success: false,
            message: "Weight must be between 0 and 10000",
          });
        }

        if (set.duration && (set.duration < 1 || set.duration > 300)) {
          return res.status(400).json({
            success: false,
            message: "Set duration must be between 1 and 300 minutes",
          });
        }
      }
    }

    if (notes && notes.trim().length > 1000) {
      return res.status(400).json({
        success: false,
        message: "Notes must be 1000 characters or less",
      });
    }

    if (location && location.trim().length > 200) {
      return res.status(400).json({
        success: false,
        message: "Location must be 200 characters or less",
      });
    }

    // Create new workout entry
    const newEntry = new WorkoutEntry({
      date: date.trim(),
      type: type.trim(),
      category,
      duration,
      intensity,
      calories,
      distance,
      sets: sets || [],
      notes: notes?.trim() || "",
      location: location?.trim() || "",
      userId,
    });

    await newEntry.save();

    const entryResponse = {
      id: newEntry._id,
      date: newEntry.date,
      type: newEntry.type,
      category: newEntry.category,
      duration: newEntry.duration,
      intensity: newEntry.intensity,
      calories: newEntry.calories,
      distance: newEntry.distance,
      sets: newEntry.sets,
      notes: newEntry.notes,
      location: newEntry.location,
      createdAt: newEntry.createdAt,
      updatedAt: newEntry.updatedAt,
    };

    res.status(201).json({
      success: true,
      message: "Workout entry created successfully",
      data: {
        entry: entryResponse,
      },
    });
  } catch (error) {
    console.error("Create workout entry error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get all workout entries for a user
export const getWorkoutEntries = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { sortBy, sortOrder, category, type, startDate, endDate } = req.query;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Build query
    const query: any = { userId };

    if (category && typeof category === "string") {
      query.category = category;
    }

    if (type && typeof type === "string") {
      query.type = { $regex: type, $options: "i" };
    }

    if (startDate && typeof startDate === "string") {
      query.date = { $gte: startDate };
    }

    if (endDate && typeof endDate === "string") {
      if (query.date) {
        query.date.$lte = endDate;
      } else {
        query.date = { $lte: endDate };
      }
    }

    // Build sort object
    let sort: any = { date: -1 }; // Default sort by date descending
    if (sortBy && typeof sortBy === "string") {
      const validSortFields = ["date", "duration", "calories", "createdAt"];
      if (validSortFields.includes(sortBy)) {
        sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };
      }
    }

    const entries = await WorkoutEntry.find(query).sort(sort).select("-__v");

    const entriesResponse = entries.map((entry) => ({
      id: entry._id,
      date: entry.date,
      type: entry.type,
      category: entry.category,
      duration: entry.duration,
      intensity: entry.intensity,
      calories: entry.calories,
      distance: entry.distance,
      sets: entry.sets,
      notes: entry.notes,
      location: entry.location,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
    }));

    res.status(200).json({
      success: true,
      message: "Workout entries retrieved successfully",
      data: {
        entries: entriesResponse,
      },
    });
  } catch (error) {
    console.error("Get workout entries error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get a specific workout entry
export const getWorkoutEntry = async (req: Request, res: Response) => {
  try {
    const { entryId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Find entry and ensure it belongs to the user
    const entry = await WorkoutEntry.findOne({ _id: entryId, userId });
    if (!entry) {
      return res.status(404).json({
        success: false,
        message: "Workout entry not found",
      });
    }

    const entryResponse = {
      id: entry._id,
      date: entry.date,
      type: entry.type,
      category: entry.category,
      duration: entry.duration,
      intensity: entry.intensity,
      calories: entry.calories,
      distance: entry.distance,
      sets: entry.sets,
      notes: entry.notes,
      location: entry.location,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
    };

    res.status(200).json({
      success: true,
      message: "Workout entry retrieved successfully",
      data: {
        entry: entryResponse,
      },
    });
  } catch (error) {
    console.error("Get workout entry error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Update a workout entry
export const updateWorkoutEntry = async (req: Request, res: Response) => {
  try {
    const { entryId } = req.params;
    const {
      date,
      type,
      category,
      duration,
      intensity,
      calories,
      distance,
      sets,
      notes,
      location,
    } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Find entry and ensure it belongs to the user
    const entry = await WorkoutEntry.findOne({ _id: entryId, userId });
    if (!entry) {
      return res.status(404).json({
        success: false,
        message: "Workout entry not found",
      });
    }

    // Validation and updates
    if (date !== undefined) {
      if (!date.trim()) {
        return res.status(400).json({
          success: false,
          message: "Date cannot be empty",
        });
      }
      entry.date = date.trim();
    }

    if (type !== undefined) {
      if (!type.trim()) {
        return res.status(400).json({
          success: false,
          message: "Workout type cannot be empty",
        });
      }
      if (type.trim().length > 100) {
        return res.status(400).json({
          success: false,
          message: "Workout type must be 100 characters or less",
        });
      }
      entry.type = type.trim();
    }

    if (category !== undefined) {
      if (
        !["cardio", "strength", "flexibility", "sports", "other"].includes(
          category
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "Valid category is required",
        });
      }
      entry.category = category;
    }

    if (duration !== undefined) {
      if (duration < 1 || duration > 1440) {
        return res.status(400).json({
          success: false,
          message: "Duration must be between 1 and 1440 minutes",
        });
      }
      entry.duration = duration;
    }

    if (intensity !== undefined) {
      if (!["low", "medium", "high"].includes(intensity)) {
        return res.status(400).json({
          success: false,
          message: "Valid intensity is required",
        });
      }
      entry.intensity = intensity;
    }

    if (calories !== undefined) {
      if (calories < 0 || calories > 10000) {
        return res.status(400).json({
          success: false,
          message: "Calories must be between 0 and 10000",
        });
      }
      entry.calories = calories;
    }

    if (distance !== undefined) {
      if (distance < 0 || distance > 1000000) {
        return res.status(400).json({
          success: false,
          message: "Distance must be between 0 and 1000000 meters",
        });
      }
      entry.distance = distance;
    }

    if (sets !== undefined) {
      if (Array.isArray(sets)) {
        for (const set of sets) {
          if (!set.exercise || !set.exercise.trim()) {
            return res.status(400).json({
              success: false,
              message: "All sets must have an exercise name",
            });
          }

          if (set.exercise.trim().length > 100) {
            return res.status(400).json({
              success: false,
              message: "Exercise names must be 100 characters or less",
            });
          }

          if (set.reps && (set.reps < 1 || set.reps > 10000)) {
            return res.status(400).json({
              success: false,
              message: "Reps must be between 1 and 10000",
            });
          }

          if (set.weight && (set.weight < 0 || set.weight > 10000)) {
            return res.status(400).json({
              success: false,
              message: "Weight must be between 0 and 10000",
            });
          }

          if (set.duration && (set.duration < 1 || set.duration > 300)) {
            return res.status(400).json({
              success: false,
              message: "Set duration must be between 1 and 300 minutes",
            });
          }
        }
        entry.sets = sets;
      }
    }

    if (notes !== undefined) {
      if (notes.trim().length > 1000) {
        return res.status(400).json({
          success: false,
          message: "Notes must be 1000 characters or less",
        });
      }
      entry.notes = notes.trim();
    }

    if (location !== undefined) {
      if (location.trim().length > 200) {
        return res.status(400).json({
          success: false,
          message: "Location must be 200 characters or less",
        });
      }
      entry.location = location.trim();
    }

    await entry.save();

    const entryResponse = {
      id: entry._id,
      date: entry.date,
      type: entry.type,
      category: entry.category,
      duration: entry.duration,
      intensity: entry.intensity,
      calories: entry.calories,
      distance: entry.distance,
      sets: entry.sets,
      notes: entry.notes,
      location: entry.location,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
    };

    res.status(200).json({
      success: true,
      message: "Workout entry updated successfully",
      data: {
        entry: entryResponse,
      },
    });
  } catch (error) {
    console.error("Update workout entry error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Delete a workout entry
export const deleteWorkoutEntry = async (req: Request, res: Response) => {
  try {
    const { entryId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Find entry and ensure it belongs to the user
    const entry = await WorkoutEntry.findOne({ _id: entryId, userId });
    if (!entry) {
      return res.status(404).json({
        success: false,
        message: "Workout entry not found",
      });
    }

    await WorkoutEntry.findByIdAndDelete(entryId);

    res.status(200).json({
      success: true,
      message: "Workout entry deleted successfully",
    });
  } catch (error) {
    console.error("Delete workout entry error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
