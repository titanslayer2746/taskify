import axios, { AxiosInstance } from "axios";
import { BACKEND_CONFIG } from "../config/backend";
import { ActionItem, ExecutionProgress } from "../types";

export class ApiService {
  private axiosInstance: AxiosInstance;

  constructor(token: string) {
    this.axiosInstance = axios.create({
      baseURL: BACKEND_CONFIG.API_URL,
      timeout: BACKEND_CONFIG.TIMEOUT,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async executeActions(
    actions: ActionItem[],
    onProgress?: (progress: ExecutionProgress) => void,
    onActionComplete?: (actionType: string, result: any) => void
  ): Promise<{ success: boolean; results: any[]; errors: any[] }> {
    const results: any[] = [];
    const errors: any[] = [];
    let completed = 0;
    const total = actions.reduce((sum, action) => sum + action.count, 0);

    for (const action of actions) {
      try {
        onProgress?.({
          step: `Starting ${action.type}...`,
          completed,
          total,
          status: "in_progress",
        });

        let actionResults: any[] = [];

        switch (action.type) {
          case "create_todos":
            actionResults = await this.createTodos(action.data, (itemIndex, totalItems) => {
              const itemCompleted = completed + itemIndex + 1;
              onProgress?.({
                step: `Creating todo ${itemIndex + 1} of ${totalItems}...`,
                completed: itemCompleted,
                total,
                status: "in_progress",
              });
            });
            break;
          case "create_habits":
            actionResults = await this.createHabits(action.data, (itemIndex, totalItems) => {
              const itemCompleted = completed + itemIndex + 1;
              onProgress?.({
                step: `Creating habit ${itemIndex + 1} of ${totalItems}...`,
                completed: itemCompleted,
                total,
                status: "in_progress",
              });
            });
            break;
          case "create_meal_plan":
            actionResults = await this.createMealPlan(action.data);
            break;
          case "create_workout_plan":
            actionResults = await this.createWorkoutPlan(action.data);
            break;
          case "create_journal":
            actionResults = await this.createJournalEntries(action.data, (itemIndex, totalItems) => {
              const itemCompleted = completed + itemIndex + 1;
              onProgress?.({
                step: `Creating journal entry ${itemIndex + 1} of ${totalItems}...`,
                completed: itemCompleted,
                total,
                status: "in_progress",
              });
            });
            break;
          default:
            console.warn(`Unknown action type: ${action.type}`);
        }

        results.push(...actionResults);
        completed += action.count;

        // Call the action complete callback
        onActionComplete?.(action.type, actionResults[0]);

        onProgress?.({
          step: `Completed ${action.type}`,
          completed,
          total,
          status: "in_progress",
        });
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
        console.log(`❌ Failed to execute ${action.type}: ${errorMessage}`);
        errors.push({
          action: action.type,
          error: errorMessage,
        });
        // Even on error, increment completed to reflect attempted items
        completed += action.count;
        onProgress?.({
          step: `Failed ${action.type}`,
          completed,
          total,
          status: "in_progress",
        });
      }
    }

    onProgress?.({
      step: "All actions completed",
      completed: total,
      total,
      status: errors.length === 0 ? "completed" : "failed",
      errors: errors.length > 0 ? errors.map((e) => e.error) : undefined,
    });

    return {
      success: errors.length === 0,
      results,
      errors,
    };
  }

  private async createTodos(
    todos: any[],
    onItemProgress?: (itemIndex: number, totalItems: number) => void
  ): Promise<any[]> {
    console.log(`📝 Creating ${todos.length} todos`);
    
    // Debug: Log the raw data from AI
    console.log("🔍 Raw todos data from AI:", JSON.stringify(todos, null, 2));
    
    // Clean up todo data to ensure proper format
    const cleanedTodos = todos.map((todo: any) => {
      const cleanedTodo: any = {
        title: todo.title,
        description: todo.description || "",
        priority: todo.priority || "medium",
        category: todo.category || "general"
      };
      
      // Fix due date format
      if (todo.dueDate) {
        // If it's already in YYYY-MM-DD format, use it
        if (typeof todo.dueDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(todo.dueDate)) {
          cleanedTodo.dueDate = todo.dueDate;
        } else {
          // Try to parse and format the date
          const date = new Date(todo.dueDate);
          if (!isNaN(date.getTime())) {
            cleanedTodo.dueDate = date.toISOString().split('T')[0]; // YYYY-MM-DD format
          } else {
            // If we can't parse it, set a default date (7 days from now)
            const defaultDate = new Date();
            defaultDate.setDate(defaultDate.getDate() + 7);
            cleanedTodo.dueDate = defaultDate.toISOString().split('T')[0];
          }
        }
      } else {
        // Set default due date (7 days from now)
        const defaultDate = new Date();
        defaultDate.setDate(defaultDate.getDate() + 7);
        cleanedTodo.dueDate = defaultDate.toISOString().split('T')[0];
      }
      
      return cleanedTodo;
    });
    
    const results = [];
    for (let i = 0; i < cleanedTodos.length; i++) {
      onItemProgress?.(i, cleanedTodos.length);
      const response = await this.axiosInstance.post("/todos", cleanedTodos[i]);
      results.push(response.data);
    }
    console.log(`✅ Created ${todos.length} todos successfully`);
    return results;
  }

  private async createHabits(
    habits: any[],
    onItemProgress?: (itemIndex: number, totalItems: number) => void
  ): Promise<any[]> {
    console.log(`🔄 Creating ${habits.length} habits`);
    const results = [];
    for (let i = 0; i < habits.length; i++) {
      onItemProgress?.(i, habits.length);
      const response = await this.axiosInstance.post("/habits", habits[i]);
      results.push(response.data);
    }
    console.log(`✅ Created ${habits.length} habits successfully`);
    return results;
  }

  private async createMealPlan(mealPlan: any): Promise<any[]> {
    // Handle both single meal plan object and array of meal plans
    const planData = Array.isArray(mealPlan) ? mealPlan[0] : mealPlan;
    
    // Convert duration from days to weeks for backend validation
    if (planData.duration && planData.duration > 52) {
      planData.duration = Math.ceil(planData.duration / 7); // Convert days to weeks
    }
    
    console.log(`🍽️ Creating meal plan: ${planData.name} (${planData.duration} weeks)`);
    
    const response = await this.axiosInstance.post("/meal", planData);
    
    if (response.data.success) {
      console.log(`✅ Meal plan created successfully: ${planData.name}`);
    } else {
      console.log(`❌ Meal plan creation failed: ${response.data.message}`);
    }
    
    return [response.data];
  }

  private async createWorkoutPlan(workoutPlan: any): Promise<any[]> {
    // Handle both single workout plan object and array of workout plans
    const planData = Array.isArray(workoutPlan) ? workoutPlan[0] : workoutPlan;
    
    // Debug: Log the raw data from AI
    console.log("🔍 Raw workout plan data from AI:", JSON.stringify(planData, null, 2));
    
    // Ensure duration is properly set
    if (!planData.duration || planData.duration === undefined) {
      planData.duration = 8; // Default to 8 weeks
    }
    
    // Convert duration from days to weeks for backend validation
    if (planData.duration && planData.duration > 52) {
      planData.duration = Math.ceil(planData.duration / 7); // Convert days to weeks
    }
    
    // Clean up the exercise data to ensure proper format
    if (planData.exercises) {
      planData.exercises = planData.exercises.map((exercise: any) => {
        const cleanedExercise: any = {
          id: exercise.id, // Keep the AI-generated ID
          name: exercise.name,
          sets: exercise.sets || 1,
          notes: exercise.notes || ""
        };
        
        // Only include reps or duration, not both
        if (exercise.reps && exercise.reps > 0 && exercise.reps <= 1000) {
          cleanedExercise.reps = exercise.reps;
        } else if (exercise.duration && exercise.duration > 0) {
          cleanedExercise.duration = exercise.duration;
        } else if (exercise.reps && exercise.reps > 1000) {
          // If reps is too high, cap it at 1000
          cleanedExercise.reps = 1000;
        } else {
          // Default to 10 reps if neither reps nor duration is valid
          cleanedExercise.reps = 10;
        }
        
        return cleanedExercise;
      });
    }
    
    console.log(`💪 Creating workout plan: ${planData.name} (${planData.duration} weeks, ${planData.exercises?.length || 0} exercises)`);
    
    const response = await this.axiosInstance.post("/workout", planData);
    
    if (response.data.success) {
      console.log(`✅ Workout plan created successfully: ${planData.name}`);
    } else {
      console.log(`❌ Workout plan creation failed: ${response.data.message}`);
    }
    
    return [response.data];
  }


  private async createJournalEntries(
    entries: any[],
    onItemProgress?: (itemIndex: number, totalItems: number) => void
  ): Promise<any[]> {
    console.log(`📖 Creating ${entries.length} journal entries`);
    const results = [];
    for (let i = 0; i < entries.length; i++) {
      onItemProgress?.(i, entries.length);
      const response = await this.axiosInstance.post("/journal", entries[i]);
      results.push(response.data);
    }
    console.log(`✅ Created ${entries.length} journal entries successfully`);
    return results;
  }
}
