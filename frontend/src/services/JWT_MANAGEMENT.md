# JWT Token Storage and Management

This document provides comprehensive documentation for the JWT token storage and management system implemented in the Habitty frontend application.

## Table of Contents

1. [Overview](#overview)
2. [Core Components](#core-components)
3. [Token Storage](#token-storage)
4. [Token Refresh Service](#token-refresh-service)
5. [React Hooks](#react-hooks)
6. [Usage Examples](#usage-examples)
7. [Security Features](#security-features)
8. [Configuration](#configuration)
9. [Best Practices](#best-practices)

## Overview

The JWT token management system provides:

- **Secure token storage** in localStorage with metadata tracking
- **Automatic token refresh** with configurable retry logic
- **Token validation** and expiration checking
- **React hooks** for easy integration
- **Type-safe** operations with TypeScript
- **Error handling** and recovery mechanisms

## Core Components

### 1. Token Storage (`storage.ts`)

Manages JWT tokens, refresh tokens, and user data in localStorage.

### 2. Token Refresh Service (`token-refresh.ts`)

Handles automatic token renewal with retry logic and error recovery.

### 3. React Hooks (`useAuth.ts`)

Provides React components with authentication state and actions.

## Token Storage

### Basic Token Operations

```typescript
import { tokenStorage } from "@/services";

// Store a token
tokenStorage.setToken("your-jwt-token");

// Get the current token
const token = tokenStorage.getToken();

// Check if token exists
const hasToken = tokenStorage.hasToken();

// Remove token
tokenStorage.removeToken();
```

### Advanced Token Features

```typescript
// Check if token is expired
const isExpired = tokenStorage.isTokenExpired();

// Get token expiration time
const expiry = tokenStorage.getTokenExpiry();

// Get token time to live (in seconds)
const ttl = tokenStorage.getTokenTTL();

// Check if token needs refresh (expires within 10 minutes)
const needsRefresh = tokenStorage.needsRefresh();

// Get token payload (decoded)
const payload = tokenStorage.getTokenPayload();

// Get user ID from token
const userId = tokenStorage.getUserId();

// Validate token structure
const isValid = tokenStorage.isValidToken(token);
```

### User Data Management

```typescript
import { userStorage } from "@/services";

// Store user data
userStorage.setUser({
  id: "user-123",
  email: "user@example.com",
  name: "John Doe",
  isActive: true,
  createdAt: "2024-01-01T00:00:00Z",
});

// Get user data
const user = userStorage.getUser();

// Update specific user fields
userStorage.updateUser({ name: "Jane Doe" });

// Get specific user properties
const userId = userStorage.getUserId();
const userEmail = userStorage.getUserEmail();
const userName = userStorage.getUserName();
```

### Refresh Token Management

```typescript
import { refreshTokenStorage } from "@/services";

// Store refresh token
refreshTokenStorage.setRefreshToken("refresh-token");

// Get refresh token
const refreshToken = refreshTokenStorage.getRefreshToken();

// Check if refresh token is expired
const isExpired = refreshTokenStorage.isRefreshTokenExpired();

// Validate refresh token
const isValid = refreshTokenStorage.isValidRefreshToken(token);
```

### Authentication Utilities

```typescript
import { authUtils } from "@/services";

// Store complete authentication data
authUtils.storeAuthData(token, refreshToken, user);

// Validate current authentication state
const authState = authUtils.validateAuthState();
// Returns: { isValid, hasToken, hasUser, isExpired, needsRefresh, hasRefreshToken, refreshTokenExpired }

// Get detailed authentication status
const status = authUtils.getAuthStatus();
// Returns comprehensive auth information for debugging

// Secure logout with cleanup
authUtils.secureLogout();

// Check if token is expiring soon (within 1 hour)
const expiringSoon = authUtils.isTokenExpiringSoon();

// Get token age in seconds
const age = authUtils.getTokenAge();
```

## Token Refresh Service

### Basic Usage

```typescript
import { tokenRefreshService } from "@/services";

// Initialize the service
tokenRefreshService.initialize();

// Force refresh token
const success = await tokenRefreshService.refreshToken();

// Check if refresh is needed
const needsRefresh = tokenRefreshService.needsRefresh();

// Get refresh status
const status = tokenRefreshService.getRefreshStatus();
// Returns: { isRefreshing, retryCount, nextRefreshIn, canRefresh }

// Stop the service
tokenRefreshService.stop();
```

### Configuration

```typescript
import { tokenRefreshService } from "@/services";

// Update configuration
tokenRefreshService.updateConfig({
  autoRefresh: true,
  refreshThreshold: 300, // 5 minutes
  maxRetries: 3,
  retryDelay: 1000,
  refreshEndpoint: "/users/refresh-token",
});

// Get current configuration
const config = tokenRefreshService.getConfig();
```

### Utility Functions

```typescript
import { tokenRefreshUtils } from "@/services";

// Initialize with custom config
tokenRefreshUtils.initialize({
  autoRefresh: true,
  refreshThreshold: 600, // 10 minutes
});

// Check and refresh if needed
const success = await tokenRefreshUtils.checkAndRefresh();

// Force refresh
const success = await tokenRefreshUtils.forceRefresh();

// Get status
const status = tokenRefreshUtils.getStatus();

// Stop service
tokenRefreshUtils.stop();
```

## React Hooks

### Main Authentication Hook

```typescript
import { useAuth } from "@/hooks/useAuth";

function MyComponent() {
  const {
    isAuthenticated,
    user,
    token,
    isLoading,
    error,
    login,
    logout,
    updateUser,
    refreshToken,
    clearError,
    getAuthStatus,
    getRefreshStatus,
    isTokenExpired,
    isTokenExpiringSoon,
    getTokenTTL,
  } = useAuth();

  // Use authentication state and actions
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <p>Welcome, {user?.name}!</p>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <div>Please log in</div>
      )}
    </div>
  );
}
```

### Specialized Hooks

```typescript
import {
  useIsAuthenticated,
  useCurrentUser,
  useToken,
  useAuthStatus,
  useAuthActions,
  useAuthState,
} from "@/hooks/useAuth";

// Check authentication status
function AuthCheck() {
  const isAuthenticated = useIsAuthenticated();
  return isAuthenticated ? <AuthenticatedApp /> : <LoginForm />;
}

// Get current user
function UserProfile() {
  const user = useCurrentUser();
  return user ? <Profile user={user} /> : <Loading />;
}

// Token management
function TokenInfo() {
  const { token, isExpired, isExpiringSoon, ttl, refresh } = useToken();

  return (
    <div>
      <p>TTL: {ttl}s</p>
      {isExpiringSoon && <button onClick={refresh}>Refresh Token</button>}
    </div>
  );
}

// Authentication actions
function AuthActions() {
  const { login, logout, updateUser } = useAuthActions();

  const handleLogin = async (credentials) => {
    const response = await apiService.login(credentials);
    login(response);
  };

  return (
    <div>
      <button onClick={handleLogin}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

## Usage Examples

### Complete Authentication Flow

```typescript
import { useAuth } from "@/hooks/useAuth";
import { apiService } from "@/services";

function LoginForm() {
  const { login, isLoading, error } = useAuth();
  const [credentials, setCredentials] = useState({ email: "", password: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await apiService.login(credentials);
      login(response);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={credentials.email}
        onChange={(e) =>
          setCredentials((prev) => ({ ...prev, email: e.target.value }))
        }
        placeholder="Email"
      />
      <input
        type="password"
        value={credentials.password}
        onChange={(e) =>
          setCredentials((prev) => ({ ...prev, password: e.target.value }))
        }
        placeholder="Password"
      />
      <button type="submit" disabled={isLoading}>
        {isLoading ? "Logging in..." : "Login"}
      </button>
      {error && <p className="error">{error}</p>}
    </form>
  );
}
```

### Protected Route Component

```typescript
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
```

### Token Refresh Integration

```typescript
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { tokenRefreshUtils } from "@/services";

function App() {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      // Initialize token refresh service
      tokenRefreshUtils.initialize({
        autoRefresh: true,
        refreshThreshold: 300, // 5 minutes
      });

      return () => {
        // Cleanup on unmount
        tokenRefreshUtils.stop();
      };
    }
  }, [isAuthenticated]);

  return <div>Your app content</div>;
}
```

### HTTP Client Integration

```typescript
import { httpClient } from "@/services";
import { createTokenRefreshInterceptor } from "@/services/token-refresh";

// Add token refresh interceptor to HTTP client
httpClient.addRequestInterceptor(createTokenRefreshInterceptor());

// Now all API calls will automatically refresh tokens when needed
const response = await httpClient.get("/api/protected-endpoint");
```

## Security Features

### 1. Token Validation

- **Structure validation**: Ensures tokens have the correct JWT format
- **Expiration checking**: Validates token expiration times
- **Payload validation**: Verifies required token claims

### 2. Secure Storage

- **localStorage isolation**: Uses prefixed keys to avoid conflicts
- **Error handling**: Graceful handling of storage errors
- **Cleanup**: Proper cleanup of all stored data on logout

### 3. Automatic Refresh

- **Proactive refresh**: Refreshes tokens before they expire
- **Retry logic**: Implements exponential backoff for failed refreshes
- **Failure handling**: Secure logout on refresh failure

### 4. Security Utilities

- **Secure logout**: Clears all auth data and caches
- **Token metadata**: Tracks token age and expiration
- **Validation utilities**: Comprehensive token validation

## Configuration

### Token Refresh Configuration

```typescript
interface TokenRefreshConfig {
  autoRefresh: boolean; // Enable automatic refresh
  refreshThreshold: number; // Seconds before expiry to refresh
  maxRetries: number; // Maximum retry attempts
  retryDelay: number; // Delay between retries (ms)
  refreshEndpoint: string; // API endpoint for refresh
}
```

### Default Configuration

```typescript
const defaultConfig = {
  autoRefresh: true,
  refreshThreshold: 300, // 5 minutes
  maxRetries: 3,
  retryDelay: 1000, // 1 second
  refreshEndpoint: "/users/refresh-token",
};
```

## Best Practices

### 1. Initialization

```typescript
// Initialize token refresh service when user logs in
useEffect(() => {
  if (isAuthenticated) {
    tokenRefreshUtils.initialize();
  }
}, [isAuthenticated]);
```

### 2. Error Handling

```typescript
// Always handle authentication errors gracefully
const handleApiError = (error) => {
  if (error.type === "AUTH_ERROR") {
    logout();
    navigate("/login");
  }
};
```

### 3. Token Validation

```typescript
// Validate tokens before using them
const makeAuthenticatedRequest = async () => {
  if (!tokenStorage.isValidToken(token)) {
    await refreshToken();
  }
  // Proceed with request
};
```

### 4. Cleanup

```typescript
// Always cleanup on component unmount
useEffect(() => {
  return () => {
    tokenRefreshService.stop();
  };
}, []);
```

### 5. Security

```typescript
// Use secure logout for sensitive operations
const handleLogout = () => {
  authUtils.secureLogout();
  // Additional cleanup if needed
};
```

## Troubleshooting

### Common Issues

1. **Token not refreshing**: Check if refresh token is valid and not expired
2. **Multiple refresh attempts**: Ensure only one refresh service instance is running
3. **Storage errors**: Check localStorage availability and quota
4. **Network errors**: Implement proper retry logic and error handling

### Debug Information

```typescript
// Get comprehensive debug information
const authStatus = authUtils.getAuthStatus();
const refreshStatus = tokenRefreshService.getRefreshStatus();

console.log("Auth Status:", authStatus);
console.log("Refresh Status:", refreshStatus);
```

This JWT token management system provides a robust, secure, and user-friendly way to handle authentication in your React application.
