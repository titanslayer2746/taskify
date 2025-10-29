# API Service Layer

This directory contains the centralized API service layer for the Habitty frontend application.

## Overview

The API service layer provides a clean, type-safe interface for communicating with the backend API. It includes:

- **Type Definitions**: Complete TypeScript interfaces for all API requests and responses
- **HTTP Client**: Custom HTTP client with authentication and error handling
- **Storage Utilities**: Secure token and user data management
- **API Service**: Centralized service class with all CRUD operations
- **Custom Hooks**: React hooks for API operations with loading and error states

## File Structure

```
services/
├── types.ts           # TypeScript type definitions
├── storage.ts         # Token and user data storage utilities
├── http-client.ts     # Custom HTTP client with interceptors
├── api.ts            # Main API service class
├── index.ts          # Export all services
└── README.md         # This documentation
```

## Usage

### Basic API Usage

```typescript
import { apiService } from "@/services";

// Authentication
const login = async (email: string, password: string) => {
  try {
    const response = await apiService.login({ email, password });
    return response.data;
  } catch (error) {
    console.error("Login failed:", error);
  }
};

// Habits
const getHabits = async () => {
  try {
    const response = await apiService.getHabits();
    return response.data.habits;
  } catch (error) {
    console.error("Failed to fetch habits:", error);
  }
};

const createHabit = async (name: string) => {
  try {
    const response = await apiService.createHabit({ name });
    return response.data.habit;
  } catch (error) {
    console.error("Failed to create habit:", error);
  }
};
```

### Using Custom Hooks

```typescript
import { useApi } from "@/hooks/useApi";
import { apiService } from "@/services";

function HabitsComponent() {
  const {
    data: habits,
    loading,
    error,
    execute: fetchHabits,
  } = useApi(apiService.getHabits);

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {habits?.data?.habits.map((habit) => (
        <div key={habit.id}>{habit.name}</div>
      ))}
    </div>
  );
}
```

### Storage Utilities

```typescript
import { tokenStorage, userStorage, clearAuthData } from "@/services";

// Store authentication data
tokenStorage.setToken("your-jwt-token");
userStorage.setUser({ id: "1", name: "John", email: "john@example.com" });

// Check authentication status
const isLoggedIn = tokenStorage.hasToken() && userStorage.hasUser();

// Clear all auth data (logout)
clearAuthData();
```

### HTTP Interceptors

```typescript
import { httpClient } from "@/services";

// Add custom request interceptor
httpClient.addRequestInterceptor((config) => {
  // Add custom headers
  const headers = new Headers(config.headers);
  headers.set("X-Custom-Header", "value");

  return {
    ...config,
    headers,
  };
});

// Add custom response interceptor
httpClient.addResponseInterceptor((response) => {
  // Log response timing
  console.log(`Response received in ${Date.now() - startTime}ms`);
  return response;
});

// Add custom error interceptor
httpClient.addErrorInterceptor((error) => {
  // Send error to analytics
  analytics.track("api_error", error);
  return error;
});
```

### Built-in Interceptors

The HTTP client comes with several built-in interceptors:

- **Authentication**: Automatically adds JWT tokens to requests
- **Logging**: Logs requests and responses in development
- **Rate Limiting**: Handles 429 responses
- **Error Handling**: Categorizes and logs errors
- **Token Refresh**: Checks token expiration and refreshes when needed

## Features

### 1. Type Safety

- Complete TypeScript interfaces for all API operations
- Compile-time error checking for request/response data
- IntelliSense support in your IDE

### 2. Authentication

- Automatic JWT token inclusion in requests
- Token storage and management
- Automatic logout on authentication errors
- Token expiration checking and refresh capabilities

### 3. HTTP Interceptors

- **Request Interceptors**: Modify requests before they're sent
- **Response Interceptors**: Process responses before they reach your code
- **Error Interceptors**: Handle and transform errors consistently
- **Built-in Interceptors**: Authentication, logging, rate limiting, error handling
- **Custom Interceptors**: Easy to add your own interceptors

### 4. Error Handling

- Comprehensive error types and messages
- Network error detection
- CORS error handling
- Automatic retry for certain error types
- Error categorization and logging

### 5. Loading States

- Built-in loading state management
- Optimistic updates support
- Automatic retry with exponential backoff

### 6. Security

- Secure token storage
- CORS support with credentials
- Input validation and sanitization
- Request/response encryption support

## API Endpoints

The service layer supports all backend endpoints:

### Authentication

- `POST /users/register` - Register new user
- `POST /users/login` - Login user
- `POST /users/logout` - Logout user
- `GET /users/profile` - Get user profile

### Habits

- `GET /habits` - Get all habits
- `GET /habits/:id` - Get single habit
- `POST /habits` - Create habit
- `PATCH /habits/:id/toggle` - Toggle completion
- `DELETE /habits/:id` - Delete habit

### Todos

- `GET /todos` - Get all todos
- `GET /todos/:id` - Get single todo
- `POST /todos` - Create todo
- `PUT /todos/:id` - Update todo
- `DELETE /todos/:id` - Delete todo

### Journal

- `GET /journal` - Get all entries
- `GET /journal/:id` - Get single entry
- `POST /journal` - Create entry
- `PUT /journal/:id` - Update entry
- `DELETE /journal/:id` - Delete entry

### Finance

- `GET /finance` - Get all entries
- `GET /finance/:id` - Get single entry
- `POST /finance` - Create entry
- `PUT /finance/:id` - Update entry
- `DELETE /finance/:id` - Delete entry

### Health & Wellness

- `GET /sleep` - Get sleep entries
- `GET /workout` - Get workout entries
- `GET /meal` - Get meal entries

## Environment Configuration

Make sure to set up your environment variables:

```bash
# .env
VITE_API_URL=http://localhost:3001/api
VITE_CHATBOT_URL=http://localhost:4000
```

## Error Types

The service layer handles different types of errors:

- `NETWORK_ERROR` - Connection issues
- `AUTH_ERROR` - Authentication/authorization issues
- `VALIDATION_ERROR` - Input validation errors
- `SERVER_ERROR` - Backend server errors
- `CORS_ERROR` - Cross-origin request issues

## Best Practices

1. **Always use try-catch**: Wrap API calls in try-catch blocks
2. **Use custom hooks**: Leverage `useApi` for loading and error states
3. **Handle errors gracefully**: Show user-friendly error messages
4. **Validate inputs**: Use TypeScript for compile-time validation
5. **Cache responses**: Consider implementing response caching for better performance

## Testing

The service layer is designed to be easily testable:

```typescript
import { ApiService } from "@/services";

// Mock the HTTP client for testing
jest.mock("@/services/http-client");

describe("ApiService", () => {
  it("should create a habit", async () => {
    const apiService = new ApiService();
    const habitData = { name: "Test Habit" };

    // Test implementation
  });
});
```
