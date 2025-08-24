// Type utilities and type guards for API service layer

import {
  ApiResponse,
  ApiError,
  User,
  Habit,
  Todo,
  JournalEntry,
  FinanceEntry,
  SleepEntry,
  WorkoutEntry,
  MealEntry,
  PaginatedResponse,
  ValidationError,
} from "./types";

// Type guards for API responses
export const isApiResponse = <T>(obj: any): obj is ApiResponse<T> => {
  return (
    typeof obj === "object" &&
    obj !== null &&
    typeof obj.success === "boolean" &&
    typeof obj.message === "string"
  );
};

export const isApiError = (obj: any): obj is ApiError => {
  return (
    typeof obj === "object" &&
    obj !== null &&
    typeof obj.type === "string" &&
    typeof obj.message === "string" &&
    [
      "NETWORK_ERROR",
      "AUTH_ERROR",
      "VALIDATION_ERROR",
      "SERVER_ERROR",
      "CORS_ERROR",
      "RATE_LIMIT_ERROR",
      "NOT_FOUND_ERROR",
      "FORBIDDEN_ERROR",
    ].includes(obj.type)
  );
};

export const isPaginatedResponse = <T>(
  obj: any
): obj is PaginatedResponse<T> => {
  return (
    typeof obj === "object" &&
    obj !== null &&
    Array.isArray(obj.data) &&
    typeof obj.pagination === "object" &&
    obj.pagination !== null &&
    typeof obj.pagination.page === "number" &&
    typeof obj.pagination.limit === "number" &&
    typeof obj.pagination.total === "number" &&
    typeof obj.pagination.totalPages === "number"
  );
};

// Type guards for specific entities
export const isUser = (obj: any): obj is User => {
  return (
    typeof obj === "object" &&
    obj !== null &&
    typeof obj.id === "string" &&
    typeof obj.email === "string" &&
    typeof obj.name === "string" &&
    typeof obj.isActive === "boolean" &&
    typeof obj.createdAt === "string"
  );
};

export const isHabit = (obj: any): obj is Habit => {
  return (
    typeof obj === "object" &&
    obj !== null &&
    typeof obj.id === "string" &&
    typeof obj.name === "string" &&
    typeof obj.completions === "object" &&
    typeof obj.createdAt === "string"
  );
};

export const isTodo = (obj: any): obj is Todo => {
  return (
    typeof obj === "object" &&
    obj !== null &&
    typeof obj.id === "string" &&
    typeof obj.title === "string" &&
    typeof obj.completed === "boolean" &&
    typeof obj.priority === "string" &&
    ["low", "medium", "high"].includes(obj.priority) &&
    typeof obj.createdAt === "string"
  );
};

export const isJournalEntry = (obj: any): obj is JournalEntry => {
  return (
    typeof obj === "object" &&
    obj !== null &&
    typeof obj.id === "string" &&
    typeof obj.title === "string" &&
    typeof obj.content === "string" &&
    typeof obj.createdAt === "string"
  );
};

export const isFinanceEntry = (obj: any): obj is FinanceEntry => {
  return (
    typeof obj === "object" &&
    obj !== null &&
    typeof obj.id === "string" &&
    typeof obj.type === "string" &&
    ["income", "expense"].includes(obj.type) &&
    typeof obj.category === "string" &&
    typeof obj.amount === "number" &&
    typeof obj.description === "string" &&
    typeof obj.date === "string" &&
    typeof obj.createdAt === "string"
  );
};

export const isSleepEntry = (obj: any): obj is SleepEntry => {
  return (
    typeof obj === "object" &&
    obj !== null &&
    typeof obj.id === "string" &&
    typeof obj.date === "string" &&
    typeof obj.bedtime === "string" &&
    typeof obj.wakeTime === "string" &&
    typeof obj.quality === "number" &&
    obj.quality >= 1 &&
    obj.quality <= 5 &&
    typeof obj.createdAt === "string"
  );
};

export const isWorkoutEntry = (obj: any): obj is WorkoutEntry => {
  return (
    typeof obj === "object" &&
    obj !== null &&
    typeof obj.id === "string" &&
    typeof obj.date === "string" &&
    typeof obj.type === "string" &&
    typeof obj.duration === "number" &&
    typeof obj.createdAt === "string"
  );
};

export const isMealEntry = (obj: any): obj is MealEntry => {
  return (
    typeof obj === "object" &&
    obj !== null &&
    typeof obj.id === "string" &&
    typeof obj.date === "string" &&
    typeof obj.mealType === "string" &&
    ["breakfast", "lunch", "dinner", "snack"].includes(obj.mealType) &&
    typeof obj.name === "string" &&
    typeof obj.createdAt === "string"
  );
};

// Utility types for API operations
export type ApiMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type ApiEndpoint =
  | "/users/register"
  | "/users/login"
  | "/users/logout"
  | "/users/profile"
  | "/users/refresh-token"
  | "/users/password-reset"
  | "/users/change-password"
  | "/habits"
  | "/habits/:id"
  | "/habits/:id/toggle"
  | "/habits/stats"
  | "/todos"
  | "/todos/:id"
  | "/todos/stats"
  | "/journal"
  | "/journal/:id"
  | "/finance"
  | "/finance/:id"
  | "/finance/stats"
  | "/sleep"
  | "/sleep/:id"
  | "/sleep/stats"
  | "/workout"
  | "/workout/:id"
  | "/workout/stats"
  | "/meal"
  | "/meal/:id"
  | "/meal/stats"
  | "/dashboard"
  | "/analytics"
  | "/export"
  | "/import"
  | "/health";

// Type for API request configuration
export interface ApiRequestConfig {
  method: ApiMethod;
  endpoint: ApiEndpoint;
  data?: any;
  params?: Record<string, any>;
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
  cache?: boolean;
}

// Type for API response with metadata
export interface ApiResponseWithMeta<T> extends ApiResponse<T> {
  meta?: {
    requestId?: string;
    timestamp?: string;
    duration?: number;
    cached?: boolean;
    retries?: number;
  };
}

// Type for batch operations
export interface BatchOperation<T> {
  operation: "create" | "update" | "delete";
  data: T | Partial<T>;
  id?: string;
}

export interface BatchRequest<T> {
  operations: BatchOperation<T>[];
  options?: {
    continueOnError?: boolean;
    validateOnly?: boolean;
  };
}

export interface BatchResponse<T> {
  results: Array<{
    operation: BatchOperation<T>;
    success: boolean;
    data?: T;
    error?: ApiError;
  }>;
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
}

// Type for real-time updates
export interface RealtimeUpdate<T> {
  type: "create" | "update" | "delete";
  entity: string;
  id: string;
  data?: T;
  timestamp: string;
  userId?: string;
}

// Type for webhook payloads
export interface WebhookPayload<T> {
  event: string;
  entity: string;
  id: string;
  data?: T;
  timestamp: string;
  signature?: string;
}

// Type for API rate limiting
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
  retryAfter?: number;
}

// Type for API caching
export interface CacheConfig {
  enabled: boolean;
  ttl: number; // Time to live in seconds
  key?: string;
  tags?: string[];
}

// Type for API monitoring
export interface ApiMetrics {
  requestCount: number;
  errorCount: number;
  averageResponseTime: number;
  slowestEndpoint?: string;
  mostErrorProneEndpoint?: string;
  lastRequestTime?: string;
}

// Utility functions for type checking
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidDate = (date: string): boolean => {
  const dateObj = new Date(date);
  return !isNaN(dateObj.getTime());
};

export const isValidUUID = (uuid: string): boolean => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

export const isValidPriority = (
  priority: string
): priority is "low" | "medium" | "high" => {
  return ["low", "medium", "high"].includes(priority);
};

export const isValidMood = (
  mood: string
): mood is "happy" | "sad" | "neutral" | "excited" | "anxious" => {
  return ["happy", "sad", "neutral", "excited", "anxious"].includes(mood);
};

export const isValidFinanceType = (
  type: string
): type is "income" | "expense" => {
  return ["income", "expense"].includes(type);
};

export const isValidMealType = (
  type: string
): type is "breakfast" | "lunch" | "dinner" | "snack" => {
  return ["breakfast", "lunch", "dinner", "snack"].includes(type);
};

// Type for validation results
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Utility function to validate API response structure
export const validateApiResponse = <T>(response: any): ValidationResult => {
  const errors: ValidationError[] = [];

  if (!isApiResponse<T>(response)) {
    errors.push({
      field: "response",
      message: "Invalid API response structure",
      value: response,
    });
    return { isValid: false, errors };
  }

  if (response.error && !isApiError(response.error)) {
    errors.push({
      field: "error",
      message: "Invalid error structure",
      value: response.error,
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Type for API response transformation
export type ResponseTransformer<T, U> = (
  response: ApiResponse<T>
) => ApiResponse<U>;

// Utility function to transform API responses
export const transformResponse = <T, U>(
  response: ApiResponse<T>,
  transformer: (data: T) => U
): ApiResponse<U> => {
  return {
    ...response,
    data: response.data ? transformer(response.data) : undefined,
  };
};

// Type for API response caching
export interface CachedResponse<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

// Utility function to check if cached response is still valid
export const isCachedResponseValid = <T>(
  cached: CachedResponse<T>
): boolean => {
  const now = Date.now();
  return now - cached.timestamp < cached.ttl * 1000;
};

// Type for API request queuing
export interface QueuedRequest {
  id: string;
  config: ApiRequestConfig;
  priority: number;
  timestamp: number;
  retries: number;
}

// Type for API request deduplication
export interface DeduplicationKey {
  method: ApiMethod;
  endpoint: string;
  params?: Record<string, any>;
  data?: any;
}

// Utility function to generate deduplication key
export const generateDeduplicationKey = (config: ApiRequestConfig): string => {
  const key: DeduplicationKey = {
    method: config.method,
    endpoint: config.endpoint,
    params: config.params,
    data: config.data,
  };
  return JSON.stringify(key);
};
