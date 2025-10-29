// Main API service class with all CRUD operations

import { httpClient } from "./http-client";
import {
  // User types
  User,
  RegisterData,
  LoginData,
  AuthResponse,

  // Habit types
  Habit,
  CreateHabitData,
  UpdateHabitData,
  ToggleCompletionData,

  // Todo types
  Todo,
  CreateTodoData,
  UpdateTodoData,

  // Journal types
  JournalEntry,
  CreateJournalData,
  UpdateJournalData,

  // Finance types
  FinanceEntry,
  CreateFinanceData,
  UpdateFinanceData,

  // Sleep types
  SleepEntry,
  CreateSleepData,
  UpdateSleepData,

  // Workout types
  WorkoutEntry,
  CreateWorkoutData,
  UpdateWorkoutData,

  // Meal types
  MealEntry,
  CreateMealData,
  UpdateMealData,

  // Common types
  ApiResponse,
  PaginationParams,
  PaginatedResponse,
  FinanceStats,
  SleepStats,
} from "./types";

class ApiService {
  // ==================== AUTHENTICATION ====================

  // Register new user
  async register(data: RegisterData): Promise<ApiResponse<AuthResponse>> {
    return httpClient.post<AuthResponse>("/users/register", data);
  }

  // Login user
  async login(data: LoginData): Promise<ApiResponse<AuthResponse>> {
    return httpClient.post<AuthResponse>("/users/login", data);
  }

  // Logout user
  async logout(): Promise<ApiResponse<void>> {
    return httpClient.post<void>("/users/logout");
  }

  // Logout from all devices
  async logoutFromAllDevices(): Promise<ApiResponse<void>> {
    return httpClient.post<void>("/users/logout-all-devices");
  }

  // Get current user profile
  async getProfile(): Promise<ApiResponse<{ user: User }>> {
    return httpClient.get<{ user: User }>("/users/profile");
  }

  // Verify OTP for email verification
  async verifyOtp(data: { email: string; otp: string }): Promise<ApiResponse<AuthResponse>> {
    return httpClient.post<AuthResponse>("/users/verify-otp", data);
  }

  // Resend OTP for email verification
  async resendOtp(data: { email: string }): Promise<ApiResponse<{ message: string; otpExpiresIn: number }>> {
    return httpClient.post<{ message: string; otpExpiresIn: number }>("/users/resend-otp", data);
  }

  // Forgot password - send reset link
  async forgotPassword(data: { email: string }): Promise<ApiResponse<{ message: string }>> {
    return httpClient.post<{ message: string }>("/users/forgot-password", data);
  }

  // Reset password - validate token and update password
  async resetPassword(data: { token: string; password: string; confirmPassword: string }): Promise<ApiResponse<{ message: string }>> {
    return httpClient.post<{ message: string }>("/users/reset-password", data);
  }

  // ==================== HABITS ====================

  // Get all habits
  async getHabits(): Promise<ApiResponse<{ habits: Habit[] }>> {
    return httpClient.get<{ habits: Habit[] }>("/habits");
  }

  // Get single habit
  async getHabit(habitId: string): Promise<ApiResponse<{ habit: Habit }>> {
    return httpClient.get<{ habit: Habit }>(`/habits/${habitId}`);
  }

  // Create new habit
  async createHabit(
    data: CreateHabitData
  ): Promise<ApiResponse<{ habit: Habit }>> {
    return httpClient.post<{ habit: Habit }>("/habits", data);
  }

  // Toggle habit completion
  async toggleHabitCompletion(
    habitId: string,
    data: ToggleCompletionData
  ): Promise<ApiResponse<{ habit: Habit }>> {
    return httpClient.patch<{ habit: Habit }>(
      `/habits/${habitId}/toggle`,
      data
    );
  }

  // Delete habit
  async deleteHabit(habitId: string): Promise<ApiResponse<void>> {
    return httpClient.delete<void>(`/habits/${habitId}`);
  }

  // ==================== TODOS ====================

  // Get all todos
  async getTodos(
    params?: PaginationParams
  ): Promise<ApiResponse<PaginatedResponse<Todo> | { todos: Todo[] }>> {
    return httpClient.get<PaginatedResponse<Todo> | { todos: Todo[] }>(
      "/todos",
      params
    );
  }

  // Get single todo
  async getTodo(todoId: string): Promise<ApiResponse<{ todo: Todo }>> {
    return httpClient.get<{ todo: Todo }>(`/todos/${todoId}`);
  }

  // Create new todo
  async createTodo(data: CreateTodoData): Promise<ApiResponse<{ todo: Todo }>> {
    return httpClient.post<{ todo: Todo }>("/todos", data);
  }

  // Update todo
  async updateTodo(
    todoId: string,
    data: UpdateTodoData
  ): Promise<ApiResponse<{ todo: Todo }>> {
    return httpClient.put<{ todo: Todo }>(`/todos/${todoId}`, data);
  }

  // Delete todo
  async deleteTodo(todoId: string): Promise<ApiResponse<void>> {
    return httpClient.delete<void>(`/todos/${todoId}`);
  }

  // ==================== JOURNAL ====================

  // Get all journal entries
  async getJournalEntries(
    params?: PaginationParams
  ): Promise<
    ApiResponse<PaginatedResponse<JournalEntry> | { entries: JournalEntry[] }>
  > {
    return httpClient.get<
      PaginatedResponse<JournalEntry> | { entries: JournalEntry[] }
    >("/journal", params);
  }

  // Get single journal entry
  async getJournalEntry(
    entryId: string
  ): Promise<ApiResponse<{ entry: JournalEntry }>> {
    return httpClient.get<{ entry: JournalEntry }>(`/journal/${entryId}`);
  }

  // Create new journal entry
  async createJournalEntry(
    data: CreateJournalData
  ): Promise<ApiResponse<{ entry: JournalEntry }>> {
    return httpClient.post<{ entry: JournalEntry }>("/journal", data);
  }

  // Update journal entry
  async updateJournalEntry(
    entryId: string,
    data: UpdateJournalData
  ): Promise<ApiResponse<{ entry: JournalEntry }>> {
    return httpClient.put<{ entry: JournalEntry }>(`/journal/${entryId}`, data);
  }

  // Delete journal entry
  async deleteJournalEntry(entryId: string): Promise<ApiResponse<void>> {
    return httpClient.delete<void>(`/journal/${entryId}`);
  }

  // ==================== FINANCE ====================

  // Get all finance entries
  async getFinanceEntries(
    params?: PaginationParams
  ): Promise<
    ApiResponse<PaginatedResponse<FinanceEntry> | { entries: FinanceEntry[] }>
  > {
    return httpClient.get<
      PaginatedResponse<FinanceEntry> | { entries: FinanceEntry[] }
    >("/finance", params);
  }

  // Get single finance entry
  async getFinanceEntry(
    entryId: string
  ): Promise<ApiResponse<{ entry: FinanceEntry }>> {
    return httpClient.get<{ entry: FinanceEntry }>(`/finance/${entryId}`);
  }

  // Create new finance entry
  async createFinanceEntry(
    data: CreateFinanceData
  ): Promise<ApiResponse<{ entry: FinanceEntry }>> {
    return httpClient.post<{ entry: FinanceEntry }>("/finance", data);
  }

  // Update finance entry
  async updateFinanceEntry(
    entryId: string,
    data: UpdateFinanceData
  ): Promise<ApiResponse<{ entry: FinanceEntry }>> {
    return httpClient.put<{ entry: FinanceEntry }>(`/finance/${entryId}`, data);
  }

  // Delete finance entry
  async deleteFinanceEntry(entryId: string): Promise<ApiResponse<void>> {
    return httpClient.delete<void>(`/finance/${entryId}`);
  }

  // Get finance statistics
  async getFinanceStats(): Promise<ApiResponse<FinanceStats>> {
    return httpClient.get<FinanceStats>("/finance/stats");
  }

  // ==================== SLEEP ====================

  // Get all sleep entries
  async getSleepEntries(
    params?: PaginationParams
  ): Promise<
    ApiResponse<PaginatedResponse<SleepEntry> | { entries: SleepEntry[] }>
  > {
    return httpClient.get<
      PaginatedResponse<SleepEntry> | { entries: SleepEntry[] }
    >("/sleep", params);
  }

  // Get single sleep entry
  async getSleepEntry(
    entryId: string
  ): Promise<ApiResponse<{ entry: SleepEntry }>> {
    return httpClient.get<{ entry: SleepEntry }>(`/sleep/${entryId}`);
  }

  // Create new sleep entry
  async createSleepEntry(
    data: CreateSleepData
  ): Promise<ApiResponse<{ entry: SleepEntry }>> {
    return httpClient.post<{ entry: SleepEntry }>("/sleep", data);
  }

  // Update sleep entry
  async updateSleepEntry(
    entryId: string,
    data: UpdateSleepData
  ): Promise<ApiResponse<{ entry: SleepEntry }>> {
    return httpClient.put<{ entry: SleepEntry }>(`/sleep/${entryId}`, data);
  }

  // Delete sleep entry
  async deleteSleepEntry(entryId: string): Promise<ApiResponse<void>> {
    return httpClient.delete<void>(`/sleep/${entryId}`);
  }

  // Get sleep statistics
  async getSleepStats(): Promise<ApiResponse<SleepStats>> {
    return httpClient.get<SleepStats>("/sleep/stats");
  }

  // ==================== WORKOUT PLANS ====================

  // Get all workout plans
  async getWorkoutPlans(): Promise<ApiResponse<{ plans: any[] }>> {
    return httpClient.get<{ plans: any[] }>("/workout");
  }

  // Get single workout plan
  async getWorkoutPlan(planId: string): Promise<ApiResponse<{ plan: any }>> {
    return httpClient.get<{ plan: any }>(`/workout/${planId}`);
  }

  // Create new workout plan
  async createWorkoutPlan(data: any): Promise<ApiResponse<{ plan: any }>> {
    return httpClient.post<{ plan: any }>("/workout", data);
  }

  // Update workout plan
  async updateWorkoutPlan(
    planId: string,
    data: any
  ): Promise<ApiResponse<{ plan: any }>> {
    return httpClient.put<{ plan: any }>(`/workout/${planId}`, data);
  }

  // Delete workout plan
  async deleteWorkoutPlan(planId: string): Promise<ApiResponse<void>> {
    return httpClient.delete<void>(`/workout/${planId}`);
  }

  // ==================== WORKOUT ENTRIES ====================

  // Get all workout entries
  async getWorkoutEntries(
    params?: PaginationParams
  ): Promise<
    ApiResponse<PaginatedResponse<WorkoutEntry> | { entries: WorkoutEntry[] }>
  > {
    return httpClient.get<
      PaginatedResponse<WorkoutEntry> | { entries: WorkoutEntry[] }
    >("/workout/entries", params);
  }

  // Get single workout entry
  async getWorkoutEntry(
    entryId: string
  ): Promise<ApiResponse<{ entry: WorkoutEntry }>> {
    return httpClient.get<{ entry: WorkoutEntry }>(
      `/workout/entries/${entryId}`
    );
  }

  // Create new workout entry
  async createWorkoutEntry(
    data: CreateWorkoutData
  ): Promise<ApiResponse<{ entry: WorkoutEntry }>> {
    return httpClient.post<{ entry: WorkoutEntry }>("/workout/entries", data);
  }

  // Update workout entry
  async updateWorkoutEntry(
    entryId: string,
    data: UpdateWorkoutData
  ): Promise<ApiResponse<{ entry: WorkoutEntry }>> {
    return httpClient.put<{ entry: WorkoutEntry }>(
      `/workout/entries/${entryId}`,
      data
    );
  }

  // Delete workout entry
  async deleteWorkoutEntry(entryId: string): Promise<ApiResponse<void>> {
    return httpClient.delete<void>(`/workout/entries/${entryId}`);
  }

  // ==================== DIET PLANS ====================

  // Get all diet plans
  async getDietPlans(): Promise<ApiResponse<{ plans: any[] }>> {
    return httpClient.get<{ plans: any[] }>("/meal");
  }

  // Get single diet plan
  async getDietPlan(planId: string): Promise<ApiResponse<{ plan: any }>> {
    return httpClient.get<{ plan: any }>(`/meal/${planId}`);
  }

  // Create new diet plan
  async createDietPlan(data: any): Promise<ApiResponse<{ plan: any }>> {
    return httpClient.post<{ plan: any }>("/meal", data);
  }

  // Update diet plan
  async updateDietPlan(
    planId: string,
    data: any
  ): Promise<ApiResponse<{ plan: any }>> {
    return httpClient.put<{ plan: any }>(`/meal/${planId}`, data);
  }

  // Delete diet plan
  async deleteDietPlan(planId: string): Promise<ApiResponse<void>> {
    return httpClient.delete<void>(`/meal/${planId}`);
  }

  // ==================== MEAL ENTRIES ====================

  // Get all meal entries
  async getMealEntries(
    params?: PaginationParams
  ): Promise<
    ApiResponse<PaginatedResponse<MealEntry> | { entries: MealEntry[] }>
  > {
    return httpClient.get<
      PaginatedResponse<MealEntry> | { entries: MealEntry[] }
    >("/meal/entries", params);
  }

  // Get single meal entry
  async getMealEntry(
    entryId: string
  ): Promise<ApiResponse<{ entry: MealEntry }>> {
    return httpClient.get<{ entry: MealEntry }>(`/meal/entries/${entryId}`);
  }

  // Create new meal entry
  async createMealEntry(
    data: CreateMealData
  ): Promise<ApiResponse<{ entry: MealEntry }>> {
    return httpClient.post<{ entry: MealEntry }>("/meal/entries", data);
  }

  // Update meal entry
  async updateMealEntry(
    entryId: string,
    data: UpdateMealData
  ): Promise<ApiResponse<{ entry: MealEntry }>> {
    return httpClient.put<{ entry: MealEntry }>(
      `/meal/entries/${entryId}`,
      data
    );
  }

  // Delete meal entry
  async deleteMealEntry(entryId: string): Promise<ApiResponse<void>> {
    return httpClient.delete<void>(`/meal/entries/${entryId}`);
  }

  // ==================== HEALTH CHECK ====================

  // Health check
  async healthCheck(): Promise<
    ApiResponse<{ status: string; timestamp: string; message: string }>
  > {
    return httpClient.get<{
      status: string;
      timestamp: string;
      message: string;
    }>("/health");
  }
}

// Create and export API service instance
export const apiService = new ApiService();

// Export the class for testing purposes
export { ApiService };
