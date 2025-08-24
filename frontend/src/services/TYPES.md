# API Type Definitions Documentation

This document provides comprehensive documentation for all TypeScript type definitions used in the Habitty API service layer.

## Table of Contents

1. [Core API Types](#core-api-types)
2. [User & Authentication Types](#user--authentication-types)
3. [Habit Types](#habit-types)
4. [Todo Types](#todo-types)
5. [Journal Types](#journal-types)
6. [Finance Types](#finance-types)
7. [Sleep Types](#sleep-types)
8. [Workout Types](#workout-types)
9. [Meal Types](#meal-types)
10. [Error & Validation Types](#error--validation-types)
11. [Pagination & Search Types](#pagination--search-types)
12. [Analytics & Stats Types](#analytics--stats-types)
13. [Utility Types](#utility-types)

## Core API Types

### `ApiResponse<T>`

Generic API response wrapper for all endpoints.

```typescript
interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: {
    type: string;
    details: string;
    [key: string]: any;
  };
}
```

### `SingleItemResponse<T>`

Response wrapper for single item operations.

```typescript
interface SingleItemResponse<T> {
  data: T;
}
```

### `ListResponse<T>`

Response wrapper for list operations.

```typescript
interface ListResponse<T> {
  data: T[];
  total?: number;
}
```

### `BulkResponse<T>`

Response wrapper for bulk operations.

```typescript
interface BulkResponse<T> {
  data: T[];
  successCount: number;
  failureCount: number;
  errors?: Array<{
    index: number;
    error: string;
  }>;
}
```

### `HealthCheckResponse`

Health check endpoint response.

```typescript
interface HealthCheckResponse {
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
```

## User & Authentication Types

### `User`

User entity type.

```typescript
interface User {
  id: string;
  email: string;
  name: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt?: string;
}
```

### `AuthResponse`

Authentication response with tokens.

```typescript
interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
  expiresIn?: number;
}
```

### `RefreshTokenResponse`

Token refresh response.

```typescript
interface RefreshTokenResponse {
  token: string;
  refreshToken?: string;
  expiresIn?: number;
}
```

### `PasswordResetRequest`

Password reset request.

```typescript
interface PasswordResetRequest {
  email: string;
}
```

### `PasswordResetConfirm`

Password reset confirmation.

```typescript
interface PasswordResetConfirm {
  token: string;
  newPassword: string;
}
```

### `ChangePasswordRequest`

Change password request.

```typescript
interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
```

### `UserProfileUpdate`

User profile update data.

```typescript
interface UserProfileUpdate {
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
```

## Habit Types

### `Habit`

Habit entity type.

```typescript
interface Habit {
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
```

### `CreateHabitData`

Data for creating a new habit.

```typescript
interface CreateHabitData {
  name: string;
  description?: string;
  category?: string;
  frequency?: "daily" | "weekly" | "monthly" | "custom";
  targetDays?: number;
}
```

### `UpdateHabitData`

Data for updating a habit.

```typescript
interface UpdateHabitData {
  name?: string;
  description?: string;
  category?: string;
  frequency?: "daily" | "weekly" | "monthly" | "custom";
  targetDays?: number;
  isActive?: boolean;
}
```

### `ToggleCompletionData`

Data for toggling habit completion.

```typescript
interface ToggleCompletionData {
  date: string;
  completed: boolean;
}
```

### `HabitStats`

Habit statistics.

```typescript
interface HabitStats {
  totalHabits: number;
  activeHabits: number;
  completedToday: number;
  currentStreak: number;
  longestStreak: number;
  completionRate: number;
}
```

## Todo Types

### `Todo`

Todo entity type.

```typescript
interface Todo {
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
```

### `CreateTodoData`

Data for creating a new todo.

```typescript
interface CreateTodoData {
  title: string;
  description?: string;
  priority?: "low" | "medium" | "high";
  dueDate?: string;
  category?: string;
  tags?: string[];
  estimatedTime?: number;
}
```

### `UpdateTodoData`

Data for updating a todo.

```typescript
interface UpdateTodoData {
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
```

### `TodoStats`

Todo statistics.

```typescript
interface TodoStats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  completionRate: number;
  averageCompletionTime: number;
}
```

## Journal Types

### `JournalEntry`

Journal entry entity type.

```typescript
interface JournalEntry {
  id: string;
  title: string;
  content: string;
  mood?: "happy" | "sad" | "neutral" | "excited" | "anxious";
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}
```

### `CreateJournalData`

Data for creating a new journal entry.

```typescript
interface CreateJournalData {
  title: string;
  content: string;
  mood?: "happy" | "sad" | "neutral" | "excited" | "anxious";
  tags?: string[];
}
```

### `UpdateJournalData`

Data for updating a journal entry.

```typescript
interface UpdateJournalData {
  title?: string;
  content?: string;
  mood?: "happy" | "sad" | "neutral" | "excited" | "anxious";
  tags?: string[];
}
```

## Finance Types

### `FinanceEntry`

Finance entry entity type.

```typescript
interface FinanceEntry {
  id: string;
  type: "income" | "expense";
  category: string;
  subcategory?: string;
  amount: number;
  currency: string;
  description: string;
  date: string;
  recurring?: {
    frequency: "weekly" | "monthly" | "yearly";
    endDate?: string;
  };
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}
```

### `CreateFinanceData`

Data for creating a new finance entry.

```typescript
interface CreateFinanceData {
  type: "income" | "expense";
  category: string;
  subcategory?: string;
  amount: number;
  currency?: string;
  description: string;
  date: string;
  recurring?: {
    frequency: "weekly" | "monthly" | "yearly";
    endDate?: string;
  };
  tags?: string[];
}
```

### `UpdateFinanceData`

Data for updating a finance entry.

```typescript
interface UpdateFinanceData {
  type?: "income" | "expense";
  category?: string;
  subcategory?: string;
  amount?: number;
  currency?: string;
  description?: string;
  date?: string;
  recurring?: {
    frequency: "weekly" | "monthly" | "yearly";
    endDate?: string;
  };
  tags?: string[];
}
```

### `FinanceStats`

Finance statistics.

```typescript
interface FinanceStats {
  totalIncome: number;
  totalExpenses: number;
  netAmount: number;
  monthlyAverage: number;
  topCategories: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
  monthlyTrend: Array<{
    month: string;
    income: number;
    expenses: number;
    net: number;
  }>;
}
```

## Sleep Types

### `SleepEntry`

Sleep entry entity type.

```typescript
interface SleepEntry {
  id: string;
  date: string;
  bedtime: string;
  wakeTime: string;
  duration: number; // in minutes
  quality: 1 | 2 | 3 | 4 | 5;
  deepSleep?: number; // in minutes
  remSleep?: number; // in minutes
  lightSleep?: number; // in minutes
  notes?: string;
  factors?: {
    caffeine?: boolean;
    exercise?: boolean;
    stress?: number; // 1-10 scale
    screenTime?: number; // in minutes
  };
  createdAt: string;
  updatedAt: string;
}
```

### `CreateSleepData`

Data for creating a new sleep entry.

```typescript
interface CreateSleepData {
  date: string;
  bedtime: string;
  wakeTime: string;
  quality: 1 | 2 | 3 | 4 | 5;
  deepSleep?: number;
  remSleep?: number;
  lightSleep?: number;
  notes?: string;
  factors?: {
    caffeine?: boolean;
    exercise?: boolean;
    stress?: number;
    screenTime?: number;
  };
}
```

### `UpdateSleepData`

Data for updating a sleep entry.

```typescript
interface UpdateSleepData {
  date?: string;
  bedtime?: string;
  wakeTime?: string;
  quality?: 1 | 2 | 3 | 4 | 5;
  deepSleep?: number;
  remSleep?: number;
  lightSleep?: number;
  notes?: string;
  factors?: {
    caffeine?: boolean;
    exercise?: boolean;
    stress?: number;
    screenTime?: number;
  };
}
```

### `SleepStats`

Sleep statistics.

```typescript
interface SleepStats {
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
```

## Workout Types

### `WorkoutEntry`

Workout entry entity type.

```typescript
interface WorkoutEntry {
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
```

### `CreateWorkoutData`

Data for creating a new workout entry.

```typescript
interface CreateWorkoutData {
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
```

### `UpdateWorkoutData`

Data for updating a workout entry.

```typescript
interface UpdateWorkoutData {
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
```

### `WorkoutStats`

Workout statistics.

```typescript
interface WorkoutStats {
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
```

## Meal Types

### `MealEntry`

Meal entry entity type.

```typescript
interface MealEntry {
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
```

### `CreateMealData`

Data for creating a new meal entry.

```typescript
interface CreateMealData {
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
```

### `UpdateMealData`

Data for updating a meal entry.

```typescript
interface UpdateMealData {
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
```

### `MealStats`

Meal statistics.

```typescript
interface MealStats {
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
```

## Error & Validation Types

### `ApiError`

API error type.

```typescript
interface ApiError {
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
```

### `ValidationError`

Validation error type.

```typescript
interface ValidationError {
  field: string;
  message: string;
  value?: any;
  constraint?: string;
}
```

### `ValidationErrorResponse`

Validation error response.

```typescript
interface ValidationErrorResponse {
  type: "VALIDATION_ERROR";
  message: string;
  errors: ValidationError[];
}
```

## Pagination & Search Types

### `PaginationParams`

Pagination parameters.

```typescript
interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  filters?: Record<string, any>;
}
```

### `PaginatedResponse<T>`

Paginated response.

```typescript
interface PaginatedResponse<T> {
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
```

### `SearchParams`

Search parameters.

```typescript
interface SearchParams {
  query: string;
  fields?: string[];
  fuzzy?: boolean;
  highlight?: boolean;
}
```

### `FilterParams`

Filter parameters.

```typescript
interface FilterParams {
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
```

## Analytics & Stats Types

### `AnalyticsData`

Analytics data.

```typescript
interface AnalyticsData {
  period: "day" | "week" | "month" | "year";
  startDate: string;
  endDate: string;
  metrics: Record<string, number>;
  trends: Array<{
    date: string;
    values: Record<string, number>;
  }>;
}
```

### `DashboardStats`

Dashboard statistics.

```typescript
interface DashboardStats {
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
```

## Utility Types

### `ExportOptions`

Export options.

```typescript
interface ExportOptions {
  format: "json" | "csv" | "pdf";
  dateRange?: {
    start: string;
    end: string;
  };
  includeDeleted?: boolean;
  categories?: string[];
}
```

### `ImportResult`

Import result.

```typescript
interface ImportResult {
  success: boolean;
  imported: number;
  failed: number;
  errors?: Array<{
    row: number;
    field: string;
    message: string;
  }>;
}
```

## Usage Examples

### Basic API Response Handling

```typescript
import { ApiResponse, User, isApiResponse, isUser } from "@/services";

async function fetchUser(id: string): Promise<User | null> {
  try {
    const response = await apiService.getProfile();

    if (isApiResponse<User>(response) && response.success && response.data) {
      if (isUser(response.data)) {
        return response.data;
      }
    }

    return null;
  } catch (error) {
    console.error("Failed to fetch user:", error);
    return null;
  }
}
```

### Type-Safe API Calls

```typescript
import { CreateHabitData, Habit, ApiResponse, isHabit } from "@/services";

async function createHabit(data: CreateHabitData): Promise<Habit | null> {
  try {
    const response: ApiResponse<{ habit: Habit }> =
      await apiService.createHabit(data);

    if (
      response.success &&
      response.data?.habit &&
      isHabit(response.data.habit)
    ) {
      return response.data.habit;
    }

    return null;
  } catch (error) {
    console.error("Failed to create habit:", error);
    return null;
  }
}
```

### Pagination Handling

```typescript
import { PaginatedResponse, Todo, PaginationParams } from "@/services";

async function fetchTodos(
  params: PaginationParams
): Promise<PaginatedResponse<Todo> | null> {
  try {
    const response = await apiService.getTodos(params);

    if (response.success && response.data) {
      return response.data as PaginatedResponse<Todo>;
    }

    return null;
  } catch (error) {
    console.error("Failed to fetch todos:", error);
    return null;
  }
}
```

### Error Handling

```typescript
import { ApiError, isApiError } from "@/services";

function handleApiError(error: unknown): void {
  if (isApiError(error)) {
    switch (error.type) {
      case "AUTH_ERROR":
        // Handle authentication error
        console.error("Authentication failed:", error.message);
        break;
      case "VALIDATION_ERROR":
        // Handle validation error
        console.error("Validation failed:", error.details);
        break;
      case "NETWORK_ERROR":
        // Handle network error
        console.error("Network error:", error.message);
        break;
      default:
        // Handle other errors
        console.error("API error:", error.message);
    }
  } else {
    // Handle unknown errors
    console.error("Unknown error:", error);
  }
}
```

## Best Practices

1. **Always use type guards** when working with API responses
2. **Validate data** before using it in your application
3. **Use specific types** instead of generic `any` types
4. **Handle errors gracefully** with proper error types
5. **Use utility functions** for common type checking operations
6. **Keep types in sync** with your backend API schema
7. **Document complex types** with JSDoc comments
8. **Use strict TypeScript configuration** for better type safety

## Type Safety Features

- **Compile-time error checking** for all API operations
- **IntelliSense support** in your IDE
- **Type guards** for runtime type checking
- **Generic types** for reusable components
- **Union types** for flexible data structures
- **Optional properties** for partial data updates
- **Strict typing** for API endpoints and methods
