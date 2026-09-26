// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: {
    type: string;
    details: string;
    [key: string]: any;
  };
}

// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  isActive: boolean;
  isEmailVerified: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
  expiresIn?: number;
  requiresVerification?: boolean;
  otpExpiresIn?: number;
}

export interface RefreshTokenResponse {
  token: string;
  refreshToken?: string;
  expiresIn?: number;
}

// Habit Types
export interface Habit {
  id: string;
  name: string;
  description?: string;
  category?: string;
  frequency: "daily" | "weekly" | "monthly" | "custom";
  targetDays?: number;
  completions: Record<string, boolean>;
  streak: number;
  totalCompletions: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateHabitData {
  name: string;
  description?: string;
  category?: string;
  frequency?: "daily" | "weekly" | "monthly" | "custom";
  targetDays?: number;
}

export interface UpdateHabitData {
  name?: string;
  description?: string;
  category?: string;
  frequency?: "daily" | "weekly" | "monthly" | "custom";
  targetDays?: number;
  isActive?: boolean;
}

export interface ToggleCompletionData {
  date: string;
}

export interface CreateHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (name: string) => void;
  isLoading?: boolean;
}

export interface HabitHeatmapProps {
  habit: Habit;
  onToggleCompletion: (habitId: string, date: string) => void;
  onDelete: (habitId: string) => void;
  isOptimistic?: boolean;
}

// Todo Types
export interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
  dueDate?: string;
  category?: string;
  tags?: string[];
  estimatedTime?: number; // in minutes
  actualTime?: number; // in minutes
  createdAt: string;
  updatedAt: string;
}

export interface CreateTodoData {
  title: string;
  description?: string;
  priority?: "low" | "medium" | "high";
  dueDate?: string;
  category?: string;
  tags?: string[];
  estimatedTime?: number;
}

export interface UpdateTodoData {
  title?: string;
  description?: string;
  completed?: boolean;
  priority?: "low" | "medium" | "high";
  dueDate?: string;
  category?: string;
  tags?: string[];
  estimatedTime?: number;
  actualTime?: number;
}

type TodoCreateInput = Omit<Todo, "id" | "createdAt" | "updatedAt">;

export interface TodoListProps {
  todos: Todo[];
  onToggleTodo: (todoId: string) => void;
  onCreateTodo: (todo: TodoCreateInput) => void;
  onDeleteClick: (todoId: string, todoTitle: string) => void;
}

export interface CreateTodoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (todo: TodoCreateInput) => void;
}

// Journal Types
export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  mood?: "happy" | "sad" | "neutral" | "excited" | "anxious";
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateJournalData {
  title: string;
  content: string;
  mood?: "happy" | "sad" | "neutral" | "excited" | "anxious";
  tags?: string[];
}

export interface UpdateJournalData {
  title?: string;
  content?: string;
  mood?: "happy" | "sad" | "neutral" | "excited" | "anxious";
  tags?: string[];
  isExplicitSave?: boolean;
}

export interface JournalCardProps {
  entry: JournalEntry;
  onDelete: (id: string) => void;
  onView: () => void;
  isOptimistic?: boolean;
}

type JournalSaveHandler = (
  id: string,
  title: string,
  content: string,
  isExplicitSave?: boolean,
  tags?: string[]
) => void | Promise<void>;

export interface JournalEditorProps {
  entry: JournalEntry;
  onSave: JournalSaveHandler;
  isOptimistic?: boolean;
}

// Finance Types
export interface FinanceEntry {
  id: string;
  title: string;
  type: "income" | "expense";
  category: string;
  amount: number;
  tags: string[];
  date: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFinanceData {
  title: string;
  type: "income" | "expense";
  category: string;
  amount: number;
  tags?: string[];
  date: string;
  description?: string;
}

export interface UpdateFinanceData {
  title?: string;
  type?: "income" | "expense";
  category?: string;
  amount?: number;
  tags?: string[];
  date?: string;
  description?: string;
}

export interface FinanceStats {
  balance: number;
  totalIncome: number;
  totalExpenses: number;
  categoryBreakdown: Record<string, { income: number; expense: number }>;
  monthlyBreakdown: Array<{
    month: string;
    income: number;
    expense: number;
    balance: number;
  }>;
  totalEntries: number;
}

export interface FinanceCardProps {
  entry: FinanceEntry;
  onDelete: (id: string) => void;
  onCopy: (entry: FinanceEntry) => void;
}

type FinanceModalSubmitData = Omit<
  FinanceEntry,
  "id" | "createdAt" | "updatedAt"
>;

export interface FinanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (entry: FinanceModalSubmitData) => void;
  copyFrom?: FinanceEntry | null;
}

export interface FinanceDashboardProps {
  entries: FinanceEntry[];
}

export interface FinanceStatsProps {
  balance: number;
  totalIncome: number;
  totalExpenses: number;
}

export interface FinancePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Sleep Types
export interface SleepEntry {
  id: string;
  checkIn: string; // ISO timestamp
  checkOut?: string; // ISO timestamp (optional for active sessions)
  duration?: number; // in minutes (calculated when checkOut is set)
  notes?: string;
  quality?: 1 | 2 | 3 | 4 | 5; // Sleep quality rating
  date: string; // YYYY-MM-DD format
  isActive?: boolean; // true if session is ongoing
  createdAt: string;
  updatedAt: string;
}

export interface CreateSleepData {
  checkIn: string; // ISO timestamp
  checkOut?: string; // ISO timestamp (optional for active sessions)
  duration?: number; // in minutes (calculated when checkOut is set)
  notes?: string;
  quality?: 1 | 2 | 3 | 4 | 5;
  date: string; // YYYY-MM-DD format
  isActive?: boolean; // true if session is ongoing
}

export interface UpdateSleepData {
  checkIn?: string; // ISO timestamp
  checkOut?: string; // ISO timestamp
  duration?: number; // in minutes
  notes?: string;
  quality?: 1 | 2 | 3 | 4 | 5;
  date?: string; // YYYY-MM-DD format
  isActive?: boolean; // false when session ends
}

export interface SleepStats {
  averageDuration: number;
  averageQuality: number;
  bestSleepTime: string;
  worstSleepTime: string;
  sleepEfficiency: number;
  weeklyTrend: Array<{
    date: string;
    duration: number;
    quality: number;
  }>;
}

export interface SleepChartProps {
  sleepEntries: SleepEntry[];
}

export interface SleepJournalEntryInput {
  title: string;
  content: string;
  tags: string[];
  date: string;
}

export interface SleepTrackerProps {
  sleepEntries: SleepEntry[];
  onAddSleepEntry: (entryData: CreateSleepData) => void;
  onUpdateSleepEntry: (
    entryId: string,
    updateData: Partial<CreateSleepData>
  ) => void;
  onDeleteSleepEntry: (entryId: string) => void;
  onAddJournalEntry: (entry: SleepJournalEntryInput) => void;
  isLoading?: boolean;
}

// Workout Types
export interface WorkoutEntry {
  id: string;
  date: string;
  type: string;
  category: "cardio" | "strength" | "flexibility" | "sports" | "other";
  duration: number; // in minutes
  intensity: "low" | "medium" | "high";
  calories?: number;
  distance?: number; // in meters
  sets?: Array<{
    exercise: string;
    reps?: number;
    weight?: number;
    duration?: number;
  }>;
  notes?: string;
  location?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkoutData {
  date: string;
  type: string;
  category?: "cardio" | "strength" | "flexibility" | "sports" | "other";
  duration: number;
  intensity?: "low" | "medium" | "high";
  calories?: number;
  distance?: number;
  sets?: Array<{
    exercise: string;
    reps?: number;
    weight?: number;
    duration?: number;
  }>;
  notes?: string;
  location?: string;
}

export interface UpdateWorkoutData {
  date?: string;
  type?: string;
  category?: "cardio" | "strength" | "flexibility" | "sports" | "other";
  duration?: number;
  intensity?: "low" | "medium" | "high";
  calories?: number;
  distance?: number;
  sets?: Array<{
    exercise: string;
    reps?: number;
    weight?: number;
    duration?: number;
  }>;
  notes?: string;
  location?: string;
}

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  duration?: number;
  notes?: string;
}

export interface WeeklySchedule {
  sunday: string[];
  monday: string[];
  tuesday: string[];
  wednesday: string[];
  thursday: string[];
  friday: string[];
  saturday: string[];
}

export interface WorkoutPlan {
  id: string;
  name: string;
  description: string;
  exercises: Exercise[];
  weeklySchedule: WeeklySchedule;
  duration: number;
  createdAt: string;
}

export interface WorkoutPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (plan: WorkoutPlan) => void;
  plan?: WorkoutPlan | null;
}

export interface PomodoroSettingsData {
  workTime: number;
  breakTime: number;
  longBreakTime: number;
  longBreakInterval: number;
}

export interface PomodoroTimerProps {
  settings: PomodoroSettingsData;
}

export interface PomodoroSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  settings: PomodoroSettingsData;
  onSettingsChange: (settings: PomodoroSettingsData) => void;
}

type MealType = "breakfast" | "lunch" | "dinner" | "snack";

interface Food {
  id: string;
  name: string;
  quantity: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

export interface Meal {
  id: string;
  name: string;
  type: MealType;
  foods: Food[];
  calories: number;
  notes?: string;
}

export interface DietPlan {
  id: string;
  name: string;
  description: string;
  meals: Meal[];
  duration: number;
  createdAt: string;
}

export interface DietPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (plan: DietPlan) => void;
  plan?: DietPlan | null;
}

// Meal Types
export interface MealEntry {
  id: string;
  date: string;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  name: string;
  calories?: number;
  protein?: number; // in grams
  carbs?: number; // in grams
  fat?: number; // in grams
  fiber?: number; // in grams
  ingredients?: Array<{
    name: string;
    amount: number;
    unit: string;
    calories?: number;
  }>;
  notes?: string;
  rating?: 1 | 2 | 3 | 4 | 5;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMealData {
  date: string;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  name: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  ingredients?: Array<{
    name: string;
    amount: number;
    unit: string;
    calories?: number;
  }>;
  notes?: string;
  rating?: 1 | 2 | 3 | 4 | 5;
}

export interface UpdateMealData {
  date?: string;
  mealType?: "breakfast" | "lunch" | "dinner" | "snack";
  name?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  ingredients?: Array<{
    name: string;
    amount: number;
    unit: string;
    calories?: number;
  }>;
  notes?: string;
  rating?: 1 | 2 | 3 | 4 | 5;
}

// API Error Types
export interface ApiError {
  type:
    | "NETWORK_ERROR"
    | "AUTH_ERROR"
    | "VALIDATION_ERROR"
    | "SERVER_ERROR"
    | "CORS_ERROR"
    | "RATE_LIMIT_ERROR"
    | "NOT_FOUND_ERROR"
    | "FORBIDDEN_ERROR";
  message: string;
  details?: string;
  status?: number;
  code?: string;
  timestamp?: string;
  requestId?: string;
}

// Pagination Types
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  filters?: Record<string, any>;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  meta?: {
    search?: string;
    filters?: Record<string, any>;
    sortBy?: string;
    sortOrder?: string;
  };
}
