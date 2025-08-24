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

// Generic API Response Wrappers
export interface SingleItemResponse<T> {
  data: T;
}

export interface ListResponse<T> {
  data: T[];
  total?: number;
}

export interface BulkResponse<T> {
  data: T[];
  successCount: number;
  failureCount: number;
  errors?: Array<{
    index: number;
    error: string;
  }>;
}

// Health Check Response
export interface HealthCheckResponse {
  status: "healthy" | "unhealthy" | "degraded";
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  services: {
    database: "healthy" | "unhealthy";
    cache?: "healthy" | "unhealthy";
    external?: "healthy" | "unhealthy";
  };
}

// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  isActive: boolean;
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
}

export interface RefreshTokenResponse {
  token: string;
  refreshToken?: string;
  expiresIn?: number;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  newPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UserProfileUpdate {
  name?: string;
  email?: string;
  avatar?: string;
  preferences?: {
    theme?: "light" | "dark" | "auto";
    notifications?: boolean;
    timezone?: string;
    language?: string;
  };
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

export interface HabitStats {
  totalHabits: number;
  activeHabits: number;
  completedToday: number;
  currentStreak: number;
  longestStreak: number;
  completionRate: number;
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

export interface TodoStats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  completionRate: number;
  averageCompletionTime: number;
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

export interface WorkoutStats {
  totalWorkouts: number;
  totalDuration: number;
  totalCalories: number;
  averageDuration: number;
  favoriteType: string;
  weeklyGoal: number;
  weeklyProgress: number;
  monthlyTrend: Array<{
    week: string;
    workouts: number;
    duration: number;
    calories: number;
  }>;
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

export interface MealStats {
  totalCalories: number;
  averageCalories: number;
  dailyGoal: number;
  macroBreakdown: {
    protein: number;
    carbs: number;
    fat: number;
  };
  weeklyTrend: Array<{
    date: string;
    calories: number;
    meals: number;
  }>;
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

// Validation Error Types
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
  constraint?: string;
}

export interface ValidationErrorResponse {
  type: "VALIDATION_ERROR";
  message: string;
  errors: ValidationError[];
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

// Search and Filter Types
export interface SearchParams {
  query: string;
  fields?: string[];
  fuzzy?: boolean;
  highlight?: boolean;
}

export interface FilterParams {
  field: string;
  operator:
    | "eq"
    | "ne"
    | "gt"
    | "gte"
    | "lt"
    | "lte"
    | "in"
    | "nin"
    | "regex"
    | "exists";
  value: any;
}

// Analytics and Metrics Types
export interface AnalyticsData {
  period: "day" | "week" | "month" | "year";
  startDate: string;
  endDate: string;
  metrics: Record<string, number>;
  trends: Array<{
    date: string;
    values: Record<string, number>;
  }>;
}

export interface DashboardStats {
  habits: HabitStats;
  todos: TodoStats;
  finance: FinanceStats;
  sleep: SleepStats;
  workout: WorkoutStats;
  meals: MealStats;
  overall: {
    productivity: number;
    health: number;
    wellness: number;
  };
}

// Export/Import Types
export interface ExportOptions {
  format: "json" | "csv" | "pdf";
  dateRange?: {
    start: string;
    end: string;
  };
  includeDeleted?: boolean;
  categories?: string[];
}

export interface ImportResult {
  success: boolean;
  imported: number;
  failed: number;
  errors?: Array<{
    row: number;
    field: string;
    message: string;
  }>;
}
