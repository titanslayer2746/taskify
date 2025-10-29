export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  type: "text" | "questions" | "follow_up_questions" | "action_plan" | "system";
  content: any;
  timestamp: Date;
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
  type:
    | "create_todos"
    | "create_meal_plan"
    | "create_workout_plan"
    | "assign_workout_schedule"
    | "create_habits"
    | "create_journal";
  count: number;
  preview: any;
  category: string;
  selected: boolean;
}

export interface ActionPlan {
  planId: string;
  conversationId: string;
  summary: string;
  actions: ActionItem[];
  category: string;
}

export interface ExecutionProgress {
  currentStep: string;
  completed: number;
  total: number;
  status: "in_progress" | "completed" | "failed";
  errors?: string[];
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

export interface Conversation {
  _id: string;
  userId: string;
  status: "active" | "completed" | "abandoned";
  intent?: any;
  createdAt: string;
  updatedAt: string;
}
