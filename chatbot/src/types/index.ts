export interface UserPayload {
  userId: string;
  email: string;
}

export interface Intent {
  goalType: string;
  target?: { value: number; unit: string };
  duration?: { value: number; unit: string };
  requiredInfo: string[];
  category?: string;
}

export interface FollowUpQuestion {
  id: string;
  text: string;
  type: "text" | "number" | "select" | "multi_select" | "slider";
  options?: string[];
  min?: number;
  max?: number;
  required?: boolean;
  placeholder?: string;
}

export interface ActionItem {
  type: string;
  count: number;
  preview: any;
  category: string;
  data?: any;
  status?: "pending" | "executing" | "completed" | "failed";
}

export interface ChatResponse {
  conversationId: string;
  response: {
    type: "text" | "follow_up_questions" | "action_plan";
    message?: string;
    questions?: FollowUpQuestion[];
    planId?: string;
    summary?: string;
    actions?: ActionItem[];
  };
}

export interface ExecutionProgress {
  step: string;
  completed: number;
  total: number;
  status: "in_progress" | "completed" | "failed";
  errors?: string[];
}

// Backend API Types
export interface TodoItem {
  title: string;
  description?: string;
  priority: "low" | "medium" | "high";
  dueDate?: string;
  category?: string;
}

export interface HabitItem {
  name: string;
  description?: string;
  category?: string;
  frequency: "daily" | "weekly" | "monthly";
}

export interface MealPlan {
  name: string;
  description: string;
  meals: any[];
  duration: number;
}

export interface WorkoutPlan {
  name: string;
  description: string;
  exercises: any[];
  weeklySchedule: any;
  duration: number;
}

export interface JournalEntry {
  title: string;
  content: string;
  tags: string[];
}

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}
