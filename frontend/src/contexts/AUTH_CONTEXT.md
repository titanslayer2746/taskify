# Authentication Context and Provider

This document provides comprehensive documentation for the authentication context and provider system implemented in the Habitty frontend application.

## Table of Contents

1. [Overview](#overview)
2. [Core Components](#core-components)
3. [AuthProvider](#authprovider)
4. [useAuth Hook](#useauth-hook)
5. [Protected Routes](#protected-routes)
6. [Usage Examples](#usage-examples)
7. [Advanced Features](#advanced-features)
8. [Best Practices](#best-practices)

## Overview

The authentication context provides:

- **Centralized state management** for authentication
- **Automatic token refresh** with configurable settings
- **Protected route components** for secure navigation
- **Type-safe** operations with TypeScript
- **Error handling** and loading states
- **Automatic initialization** from stored tokens

## Core Components

### 1. AuthProvider (`AuthContext.tsx`)

The main provider component that wraps your application and manages authentication state.

### 2. useAuth Hook (`AuthContext.tsx`)

Custom hook for accessing authentication state and actions throughout your components.

### 3. ProtectedRoute (`ProtectedRoute.tsx`)

Component for protecting routes that require authentication.

## AuthProvider

### Basic Usage

```typescript
import { AuthProvider } from "@/contexts/AuthContext";

function App() {
  return (
    <AuthProvider
      onAuthStateChange={(isAuthenticated, user) => {
        console.log("Auth state changed:", { isAuthenticated, user });
      }}
      autoRefresh={true}
      refreshThreshold={300}
    >
      <YourAppContent />
    </AuthProvider>
  );
}
```

### Props

```typescript
interface AuthProviderProps {
  children: ReactNode;
  onAuthStateChange?: (isAuthenticated: boolean, user: User | null) => void;
  autoRefresh?: boolean; // Enable automatic token refresh
  refreshThreshold?: number; // Seconds before expiry to refresh
}
```

### Configuration Options

```typescript
// Default configuration
const defaultConfig = {
  autoRefresh: true,
  refreshThreshold: 300, // 5 minutes
};
```

## useAuth Hook

### Basic Usage

```typescript
import { useAuth } from "@/contexts/AuthContext";

function MyComponent() {
  const {
    isAuthenticated,
    user,
    token,
    isLoading,
    error,
    isInitialized,
    login,
    logout,
    updateUser,
    refreshToken,
    clearError,
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

### Available State

```typescript
interface AuthState {
  isAuthenticated: boolean; // Whether user is authenticated
  user: User | null; // Current user data
  token: string | null; // Current access token
  isLoading: boolean; // Loading state
  error: string | null; // Error message
  isInitialized: boolean; // Whether auth is initialized
}
```

### Available Actions

```typescript
interface AuthActions {
  login: (authData: AuthResponse) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  refreshToken: () => Promise<boolean>;
  clearError: () => void;
  initialize: () => Promise<void>;
}
```

### Utility Methods

```typescript
// Get detailed authentication status
const { getAuthStatus, getRefreshStatus } = useAuth();
const authStatus = getAuthStatus();
const refreshStatus = getRefreshStatus();

// Token utilities
const { isTokenExpired, isTokenExpiringSoon, getTokenTTL } = useAuth();
const isExpired = isTokenExpired();
const isExpiringSoon = isTokenExpiringSoon();
const ttl = getTokenTTL();
```

## Specialized Hooks

### useIsAuthenticated

```typescript
import { useIsAuthenticated } from "@/contexts/AuthContext";

function AuthCheck() {
  const isAuthenticated = useIsAuthenticated();
  return isAuthenticated ? <AuthenticatedApp /> : <LoginForm />;
}
```

### useCurrentUser

```typescript
import { useCurrentUser } from "@/contexts/AuthContext";

function UserProfile() {
  const user = useCurrentUser();
  return user ? <Profile user={user} /> : <Loading />;
}
```

### useToken

```typescript
import { useToken } from "@/contexts/AuthContext";

function TokenInfo() {
  const { token, isExpired, isExpiringSoon, ttl, refresh } = useToken();

  return (
    <div>
      <p>TTL: {ttl}s</p>
      {isExpiringSoon && <button onClick={refresh}>Refresh Token</button>}
    </div>
  );
}
```

### useAuthActions

```typescript
import { useAuthActions } from "@/contexts/AuthContext";

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

## Protected Routes

### Basic Protected Route

```typescript
import { ProtectedRoute } from "@/components/ProtectedRoute";

function App() {
  return (
    <Routes>
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
```

### Custom Redirect

```typescript
<ProtectedRoute redirectTo="/login">
  <Dashboard />
</ProtectedRoute>
```

### Custom Loading Component

```typescript
const CustomLoading = ({ message }) => (
  <div className="custom-loading">
    <Spinner />
    <p>{message}</p>
  </div>
);

<ProtectedRoute loadingComponent={CustomLoading}>
  <Dashboard />
</ProtectedRoute>;
```

### Custom Error Component

```typescript
const CustomError = ({ error, onRetry }) => (
  <div className="custom-error">
    <h2>Authentication Error</h2>
    <p>{error}</p>
    <button onClick={onRetry}>Try Again</button>
  </div>
);

<ProtectedRoute errorComponent={CustomError}>
  <Dashboard />
</ProtectedRoute>;
```

### Public Routes

```typescript
import { PublicRoute } from "@/components/ProtectedRoute";

<PublicRoute redirectTo="/dashboard">
  <LoginForm />
</PublicRoute>;
```

### Route Guards

```typescript
import { RouteGuard } from "@/components/ProtectedRoute";

<RouteGuard condition={user?.role === "admin"}>
  <AdminPanel />
</RouteGuard>;
```

## Usage Examples

### Complete Authentication Flow

```typescript
import { useAuth } from "@/contexts/AuthContext";
import { apiService } from "@/services";

function LoginForm() {
  const { login, isLoading, error } = useAuth();
  const [credentials, setCredentials] = useState({ email: "", password: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await apiService.login(credentials);
      await login(response);
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

### App Integration

```typescript
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute, PublicRoute } from "@/components/ProtectedRoute";

function App() {
  const handleAuthStateChange = (isAuthenticated, user) => {
    console.log("Auth state changed:", { isAuthenticated, user });

    // Additional logic:
    // - Analytics tracking
    // - User preferences loading
    // - Notification setup
    // - Theme preferences
  };

  return (
    <AuthProvider
      onAuthStateChange={handleAuthStateChange}
      autoRefresh={true}
      refreshThreshold={300}
    >
      <Router>
        <Routes>
          {/* Public routes */}
          <Route
            path="/"
            element={
              <PublicRoute redirectTo="/dashboard">
                <LandingPage />
              </PublicRoute>
            }
          />

          <Route
            path="/login"
            element={
              <PublicRoute redirectTo="/dashboard">
                <LoginForm />
              </PublicRoute>
            }
          />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
```

### Conditional Rendering

```typescript
import { AuthStatus, ConditionalRender } from "@/components/ProtectedRoute";

function App() {
  return (
    <AuthStatus>
      {({ isAuthenticated, isLoading, isInitialized, error }) => (
        <div>
          {isLoading && <LoadingSpinner />}
          {error && <ErrorMessage error={error} />}

          <ConditionalRender when={isAuthenticated}>
            <AuthenticatedApp />
            <LoginPrompt />
          </ConditionalRender>
        </div>
      )}
    </AuthStatus>
  );
}
```

## Advanced Features

### Higher-Order Component

```typescript
import { withAuth } from "@/contexts/AuthContext";

const ProtectedComponent = withAuth(MyComponent);

// With custom fallback
const ProtectedComponent = withAuth(MyComponent, () => <LoginPrompt />);
```

### Auth State Change Callback

```typescript
function App() {
  const handleAuthStateChange = (isAuthenticated, user) => {
    if (isAuthenticated) {
      // User logged in
      analytics.track("user_login", { userId: user.id });
      loadUserPreferences(user.id);
      setupNotifications(user.id);
    } else {
      // User logged out
      analytics.track("user_logout");
      clearUserData();
    }
  };

  return (
    <AuthProvider onAuthStateChange={handleAuthStateChange}>
      <AppContent />
    </AuthProvider>
  );
}
```

### Custom Loading States

```typescript
function App() {
  return (
    <AuthProvider>
      <AuthStatus>
        {({ isInitialized, isLoading }) => {
          if (!isInitialized) {
            return <AppInitializing />;
          }

          if (isLoading) {
            return <AppLoading />;
          }

          return <AppContent />;
        }}
      </AuthStatus>
    </AuthProvider>
  );
}
```

## Best Practices

### 1. Provider Placement

```typescript
// Place AuthProvider at the top level of your app
function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}
```

### 2. Error Handling

```typescript
function MyComponent() {
  const { error, clearError } = useAuth();

  useEffect(() => {
    if (error) {
      // Show error notification
      showNotification("error", error);
      // Clear error after showing
      setTimeout(clearError, 5000);
    }
  }, [error, clearError]);
}
```

### 3. Loading States

```typescript
function MyComponent() {
  const { isLoading, isInitialized } = useAuth();

  if (!isInitialized) {
    return <AppInitializing />;
  }

  if (isLoading) {
    return <ComponentLoading />;
  }

  return <ComponentContent />;
}
```

### 4. Token Management

```typescript
function MyComponent() {
  const { isTokenExpiringSoon, refreshToken } = useAuth();

  useEffect(() => {
    if (isTokenExpiringSoon()) {
      // Proactively refresh token
      refreshToken();
    }
  }, [isTokenExpiringSoon, refreshToken]);
}
```

### 5. User Updates

```typescript
function ProfileForm() {
  const { updateUser } = useAuth();

  const handleSubmit = async (formData) => {
    try {
      await apiService.updateProfile(formData);
      updateUser(formData);
      showNotification("success", "Profile updated successfully");
    } catch (error) {
      showNotification("error", "Failed to update profile");
    }
  };
}
```

### 6. Cleanup

```typescript
function MyComponent() {
  const { logout } = useAuth();

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      // The AuthProvider handles most cleanup automatically
    };
  }, []);
}
```

## Troubleshooting

### Common Issues

1. **Context not found**: Ensure `useAuth` is used within `AuthProvider`
2. **Infinite loading**: Check if initialization is stuck in loading state
3. **Token refresh issues**: Verify refresh token configuration
4. **Route protection not working**: Ensure `ProtectedRoute` is used correctly

### Debug Information

```typescript
function DebugAuth() {
  const { getAuthStatus, getRefreshStatus } = useAuth();

  const authStatus = getAuthStatus();
  const refreshStatus = getRefreshStatus();

  console.log("Auth Status:", authStatus);
  console.log("Refresh Status:", refreshStatus);

  return null;
}
```

This authentication context system provides a robust, type-safe, and user-friendly way to manage authentication throughout your React application.
