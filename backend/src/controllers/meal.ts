import { Request, Response } from "express";
import { DietPlan } from "../models/Diet";

interface FoodInput {
  id?: string;
  name: string;
  quantity: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

interface MealInput {
  id?: string;
  name: string;
  type: "breakfast" | "lunch" | "dinner" | "snack";
  foods: FoodInput[];
  calories: number;
  notes?: string;
}

interface SortQuery {
  [key: string]: 1 | -1;
}

// Create a new diet plan
export const createDietPlan = async (req: Request, res: Response) => {
  try {
    const { name, description, meals, duration } = req.body;
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

    if (!meals || !Array.isArray(meals) || meals.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one meal is required",
      });
    }

    // Validate meals
    for (const meal of meals) {
      if (!meal.name || !meal.name.trim()) {
        return res.status(400).json({
          success: false,
          message: "All meals must have a name",
        });
      }

      if (meal.name.trim().length > 100) {
        return res.status(400).json({
          success: false,
          message: "Meal names must be 100 characters or less",
        });
      }

      if (
        !meal.type ||
        !["breakfast", "lunch", "dinner", "snack"].includes(meal.type)
      ) {
        return res.status(400).json({
          success: false,
          message: "Meal type must be breakfast, lunch, dinner, or snack",
        });
      }

      // Foods array is optional and can be empty (frontend doesn't manage foods yet)
      if (meal.foods && !Array.isArray(meal.foods)) {
        return res.status(400).json({
          success: false,
          message: "Meal foods must be an array",
        });
      }

      // Validate foods if provided
      if (meal.foods && meal.foods.length > 0) {
        for (const food of meal.foods) {
          if (!food.name || !food.name.trim()) {
            return res.status(400).json({
              success: false,
              message: "All foods must have a name",
            });
          }

          if (food.name.trim().length > 100) {
            return res.status(400).json({
              success: false,
              message: "Food names must be 100 characters or less",
            });
          }

          if (!food.quantity || !food.quantity.trim()) {
            return res.status(400).json({
              success: false,
              message: "All foods must have a quantity",
            });
          }

          if (food.quantity.trim().length > 50) {
            return res.status(400).json({
              success: false,
              message: "Food quantity must be 50 characters or less",
            });
          }

          if (!food.calories || food.calories < 0 || food.calories > 10000) {
            return res.status(400).json({
              success: false,
              message: "Food calories must be between 0 and 10000",
            });
          }

          if (
            food.protein !== undefined &&
            (food.protein < 0 || food.protein > 1000)
          ) {
            return res.status(400).json({
              success: false,
              message: "Food protein must be between 0 and 1000",
            });
          }

          if (
            food.carbs !== undefined &&
            (food.carbs < 0 || food.carbs > 1000)
          ) {
            return res.status(400).json({
              success: false,
              message: "Food carbs must be between 0 and 1000",
            });
          }

          if (food.fat !== undefined && (food.fat < 0 || food.fat > 1000)) {
            return res.status(400).json({
              success: false,
              message: "Food fat must be between 0 and 1000",
            });
          }
        }
      }

      // Meal calories validation - can be 0 (frontend sets this)
      if (
        meal.calories === undefined ||
        meal.calories < 0 ||
        meal.calories > 10000
      ) {
        return res.status(400).json({
          success: false,
          message: "Meal calories must be between 0 and 10000",
        });
      }

      if (meal.notes && meal.notes.trim().length > 500) {
        return res.status(400).json({
          success: false,
          message: "Meal notes must be 500 characters or less",
        });
      }
    }

    // Validate duration
    if (!duration || duration < 1 || duration > 52) {
      return res.status(400).json({
        success: false,
        message: "Duration must be between 1 and 52 weeks",
      });
    }

    // Generate IDs for meals and foods (matching frontend approach)
    const mealsWithIds = meals.map((meal: MealInput, mealIndex: number) => ({
      id:
        meal.id ||
        `meal_${Date.now()}_${mealIndex}_${Math.random()
          .toString(36)
          .substring(2, 8)}`,
      name: meal.name.trim(),
      type: meal.type,
      foods: (meal.foods || []).map((food: FoodInput, foodIndex: number) => ({
        id:
          food.id ||
          `food_${Date.now()}_${mealIndex}_${foodIndex}_${Math.random()
            .toString(36)
            .substring(2, 8)}`,
        name: food.name.trim(),
        quantity: food.quantity.trim(),
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat,
      })),
      calories: meal.calories,
      notes: meal.notes?.trim() || "",
    }));

    // Create new diet plan
    const newPlan = new DietPlan({
      name: name.trim(),
      description: description?.trim() || "",
      meals: mealsWithIds as any,
      duration,
      userId,
    });

    await newPlan.save();

    const planResponse = {
      id: newPlan._id,
      name: newPlan.name,
      description: newPlan.description,
      meals: newPlan.meals,
      duration: newPlan.duration,
      createdAt: newPlan.createdAt,
      updatedAt: newPlan.updatedAt,
    };

    res.status(201).json({
      success: true,
      message: "Diet plan created successfully",
      data: {
        plan: planResponse,
      },
    });
  } catch (error) {
    console.error("Create diet plan error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get all diet plans for a user
export const getDietPlans = async (req: Request, res: Response) => {
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

    const plans = await DietPlan.find({ userId }).sort(sort).select("-__v");

    const plansResponse = plans.map((plan) => ({
      id: plan._id,
      name: plan.name,
      description: plan.description,
      meals: plan.meals,
      duration: plan.duration,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
    }));

    res.status(200).json({
      success: true,
      message: "Diet plans retrieved successfully",
      data: {
        plans: plansResponse,
      },
    });
  } catch (error) {
    console.error("Get diet plans error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get a specific diet plan
export const getDietPlan = async (req: Request, res: Response) => {
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
    const plan = await DietPlan.findOne({ _id: planId, userId });
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Diet plan not found",
      });
    }

    const planResponse = {
      id: plan._id,
      name: plan.name,
      description: plan.description,
      meals: plan.meals,
      duration: plan.duration,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
    };

    res.status(200).json({
      success: true,
      message: "Diet plan retrieved successfully",
      data: {
        plan: planResponse,
      },
    });
  } catch (error) {
    console.error("Get diet plan error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Update a diet plan
export const updateDietPlan = async (req: Request, res: Response) => {
  try {
    const { planId } = req.params;
    const { name, description, meals, duration } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Find plan and ensure it belongs to the user
    const plan = await DietPlan.findOne({ _id: planId, userId });
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Diet plan not found",
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

    if (meals !== undefined) {
      if (!Array.isArray(meals) || meals.length === 0) {
        return res.status(400).json({
          success: false,
          message: "At least one meal is required",
        });
      }

      // Validate meals
      for (const meal of meals) {
        if (!meal.name || !meal.name.trim()) {
          return res.status(400).json({
            success: false,
            message: "All meals must have a name",
          });
        }

        if (meal.name.trim().length > 100) {
          return res.status(400).json({
            success: false,
            message: "Meal names must be 100 characters or less",
          });
        }

        if (
          !meal.type ||
          !["breakfast", "lunch", "dinner", "snack"].includes(meal.type)
        ) {
          return res.status(400).json({
            success: false,
            message: "Meal type must be breakfast, lunch, dinner, or snack",
          });
        }

        // Foods array is optional and can be empty (frontend doesn't manage foods yet)
        if (meal.foods && !Array.isArray(meal.foods)) {
          return res.status(400).json({
            success: false,
            message: "Meal foods must be an array",
          });
        }

        // Validate foods if provided
        if (meal.foods && meal.foods.length > 0) {
          for (const food of meal.foods) {
            if (!food.name || !food.name.trim()) {
              return res.status(400).json({
                success: false,
                message: "All foods must have a name",
              });
            }

            if (food.name.trim().length > 100) {
              return res.status(400).json({
                success: false,
                message: "Food names must be 100 characters or less",
              });
            }

            if (!food.quantity || !food.quantity.trim()) {
              return res.status(400).json({
                success: false,
                message: "All foods must have a quantity",
              });
            }

            if (food.quantity.trim().length > 50) {
              return res.status(400).json({
                success: false,
                message: "Food quantity must be 50 characters or less",
              });
            }

            if (!food.calories || food.calories < 0 || food.calories > 10000) {
              return res.status(400).json({
                success: false,
                message: "Food calories must be between 0 and 10000",
              });
            }

            if (
              food.protein !== undefined &&
              (food.protein < 0 || food.protein > 1000)
            ) {
              return res.status(400).json({
                success: false,
                message: "Food protein must be between 0 and 1000",
              });
            }

            if (
              food.carbs !== undefined &&
              (food.carbs < 0 || food.carbs > 1000)
            ) {
              return res.status(400).json({
                success: false,
                message: "Food carbs must be between 0 and 1000",
              });
            }

            if (food.fat !== undefined && (food.fat < 0 || food.fat > 1000)) {
              return res.status(400).json({
                success: false,
                message: "Food fat must be between 0 and 1000",
              });
            }
          }
        }

        // Meal calories validation - can be 0 (frontend sets this)
        if (
          meal.calories === undefined ||
          meal.calories < 0 ||
          meal.calories > 10000
        ) {
          return res.status(400).json({
            success: false,
            message: "Meal calories must be between 0 and 10000",
          });
        }

        if (meal.notes && meal.notes.trim().length > 500) {
          return res.status(400).json({
            success: false,
            message: "Meal notes must be 500 characters or less",
          });
        }
      }

      // Generate IDs for meals and foods (matching frontend approach)
      const mealsWithIds = meals.map((meal: MealInput, mealIndex: number) => ({
        id:
          meal.id ||
          `meal_${Date.now()}_${mealIndex}_${Math.random()
            .toString(36)
            .substring(2, 8)}`,
        name: meal.name.trim(),
        type: meal.type,
        foods: (meal.foods || []).map((food: FoodInput, foodIndex: number) => ({
          id:
            food.id ||
            `food_${Date.now()}_${mealIndex}_${foodIndex}_${Math.random()
              .toString(36)
              .substring(2, 8)}`,
          name: food.name.trim(),
          quantity: food.quantity.trim(),
          calories: food.calories,
          protein: food.protein,
          carbs: food.carbs,
          fat: food.fat,
        })),
        calories: meal.calories,
        notes: meal.notes?.trim() || "",
      }));

      plan.meals = mealsWithIds as any;
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
      id: plan._id,
      name: plan.name,
      description: plan.description,
      meals: plan.meals,
      duration: plan.duration,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
    };

    res.status(200).json({
      success: true,
      message: "Diet plan updated successfully",
      data: {
        plan: planResponse,
      },
    });
  } catch (error) {
    console.error("Update diet plan error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Delete a diet plan
export const deleteDietPlan = async (req: Request, res: Response) => {
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
    const plan = await DietPlan.findOne({ _id: planId, userId });
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Diet plan not found",
      });
    }

    await DietPlan.findByIdAndDelete(planId);

    res.status(200).json({
      success: true,
      message: "Diet plan deleted successfully",
    });
  } catch (error) {
    console.error("Delete diet plan error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
