# Route Protection Implementation

This document explains how all feature routes in the frontend have been protected using authentication-based route guards.

## Overview

The route protection system ensures that:

- **Authenticated users** can access all feature pages
- **Unauthenticated users** are redirected to the sign-in page
- **Public routes** (landing page, sign-in, sign-up) are accessible to everyone
- **Loading states** are properly handled during authentication checks

## Protected Routes

### Feature Routes (Protected)

All feature routes require authentication:

- `/habits` - Habit tracking
- `/todo` - Task management
- `/pomodoro` - Pomodoro timer
- `/finance-tracker` - Finance tracking
- `/journal` - Journal entries
- `/journal/:id` - Individual journal entries
- `/health` - Health & wellness
- `/health/workout/:id` - Individual workout plans
- `/health/diet/:id` - Individual diet plans
- `/sleep` - Sleep tracking

### Public Routes

Routes accessible to everyone:

- `/` - Landing page (redirects authenticated users to `/habits`)
- `/signin` - Sign in page (redirects authenticated users to `/habits`)
- `/signup` - Sign up page (redirects authenticated users to `/habits`)

## Implementation Details

### App.tsx Route Configuration

```typescript
import { ProtectedRoute, PublicRoute } from "@/components/ProtectedRoute";

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/"
          element={
            <PublicRoute redirectTo="/habits">
              <Index />
            </PublicRoute>
          }
        />
        <Route
          path="/signin"
          element={
            <PublicRoute redirectTo="/habits">
              <SignIn />
            </PublicRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicRoute redirectTo="/habits">
              <SignUp />
            </PublicRoute>
          }
        />

        {/* Protected Feature Routes */}
        <Route
          path="/habits"
          element={
            <ProtectedRoute>
              <Habits />
            </ProtectedRoute>
          }
        />
        {/* ... other protected routes */}
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);
```

### ProtectedRoute Component

The `ProtectedRoute` component:

1. **Checks authentication status** from the auth context
2. **Shows loading state** while authentication is being initialized
3. **Redirects unauthenticated users** to the sign-in page
4. **Preserves the intended destination** in the URL state for post-login redirect
5. **Handles error states** gracefully

```typescript
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  redirectTo = "/signin",
  requireAuth = true,
  fallback,
  loadingComponent: LoadingComponent = DefaultLoadingComponent,
  errorComponent: ErrorComponent = DefaultErrorComponent,
  onUnauthorized,
}) => {
  const { isAuthenticated, isLoading, error, isInitialized } = useAuth();
  const location = useLocation();

  // Handle loading state
  if (!isInitialized || isLoading) {
    return <LoadingComponent message="Initializing authentication..." />;
  }

  // Handle error state
  if (error) {
    return (
      <ErrorComponent error={error} onRetry={() => window.location.reload()} />
    );
  }

  // Handle authentication requirement
  if (requireAuth && !isAuthenticated) {
    onUnauthorized?.();
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Render children if all conditions are met
  return <>{children}</>;
};
```

### PublicRoute Component

The `PublicRoute` component:

1. **Redirects authenticated users** away from public pages
2. **Shows loading state** during authentication checks
3. **Allows unauthenticated users** to access the page

```typescript
export const PublicRoute: React.FC<PublicRouteProps> = ({
  children,
  redirectTo = "/",
  fallback,
  loadingComponent: LoadingComponent = DefaultLoadingComponent,
}) => {
  const { isAuthenticated, isLoading, isInitialized } = useAuth();

  // Handle loading state
  if (!isInitialized || isLoading) {
    return <LoadingComponent message="Loading..." />;
  }

  // Redirect authenticated users away from public routes
  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // Render children for non-authenticated users
  return <>{children}</>;
};
```

## Authentication Flow

### For Unauthenticated Users

1. **User tries to access protected route** (e.g., `/habits`)
2. **ProtectedRoute checks authentication status**
3. **User is redirected to `/signin`** with return URL preserved
4. **User signs in successfully**
5. **User is redirected back to original destination** (`/habits`)

### For Authenticated Users

1. **User tries to access public route** (e.g., `/signin`)
2. **PublicRoute checks authentication status**
3. **User is redirected to dashboard** (`/habits`)
4. **User can access all feature routes normally**

## Loading States

### Default Loading Component

```typescript
const DefaultLoadingComponent: React.FC<LoadingComponentProps> = ({
  message = "Loading...",
}) => (
  <div className="flex items-center justify-center min-h-screen bg-gray-900">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
      <p className="text-gray-300 text-lg">{message}</p>
    </div>
  </div>
);
```

### Default Error Component

```typescript
const DefaultErrorComponent: React.FC<ErrorComponentProps> = ({
  error,
  onRetry,
}) => (
  <div className="flex items-center justify-center min-h-screen bg-gray-900">
    <div className="text-center">
      <div className="text-red-500 text-6xl mb-4">⚠️</div>
      <h2 className="text-red-400 text-xl font-semibold mb-2">
        Authentication Error
      </h2>
      <p className="text-gray-300 mb-4">{error}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  </div>
);
```

## URL State Preservation

When users are redirected to sign-in, the original URL is preserved:

```typescript
// In ProtectedRoute
return <Navigate to={redirectTo} state={{ from: location }} replace />;
```

This allows the sign-in page to redirect users back to their intended destination:

```typescript
// In SignIn component
const location = useLocation();
const from = location.state?.from?.pathname || "/habits";

// After successful login
navigate(from);
```

## Customization Options

### Custom Loading Component

```typescript
<ProtectedRoute loadingComponent={CustomLoadingSpinner}>
  <Habits />
</ProtectedRoute>
```

### Custom Error Component

```typescript
<ProtectedRoute errorComponent={CustomErrorDisplay}>
  <Habits />
</ProtectedRoute>
```

### Custom Redirect Path

```typescript
<ProtectedRoute redirectTo="/custom-login">
  <Habits />
</ProtectedRoute>
```

### Unauthorized Callback

```typescript
<ProtectedRoute
  onUnauthorized={() => {
    console.log("User tried to access protected route");
    // Custom logic here
  }}
>
  <Habits />
</ProtectedRoute>
```

## Security Features

### 1. Route-Level Protection

- Every feature route is wrapped with `ProtectedRoute`
- No direct access to protected pages without authentication

### 2. Automatic Redirects

- Unauthenticated users are automatically redirected to sign-in
- Authenticated users are redirected away from public pages

### 3. URL State Preservation

- Original destination is preserved during redirects
- Users return to intended page after authentication

### 4. Loading State Management

- Proper loading states during authentication checks
- Prevents flash of content or unauthorized access

### 5. Error Handling

- Graceful error handling for authentication failures
- Retry mechanisms for failed authentication checks

## Testing Scenarios

### Test Cases

1. **Unauthenticated user tries to access `/habits`**

   - Should be redirected to `/signin`
   - Return URL should be preserved

2. **Authenticated user tries to access `/signin`**

   - Should be redirected to `/habits`

3. **User signs in successfully**

   - Should be redirected to original destination

4. **User signs out**

   - Should be redirected to `/signin` on next protected route access

5. **Network error during authentication check**
   - Should show error component with retry option

### Manual Testing

1. **Start the application**
2. **Try to access `/habits` without signing in**
3. **Verify redirect to `/signin`**
4. **Sign in with valid credentials**
5. **Verify redirect to `/habits`**
6. **Try to access `/signin` while authenticated**
7. **Verify redirect to `/habits`**
8. **Sign out and try to access protected routes**
9. **Verify redirect to `/signin`**

## Best Practices

### 1. Always Use Route Protection

- Wrap all feature routes with `ProtectedRoute`
- Use `PublicRoute` for authentication pages

### 2. Handle Loading States

- Provide meaningful loading messages
- Use consistent loading UI across the app

### 3. Preserve User Intent

- Always preserve the original destination URL
- Redirect users back after successful authentication

### 4. Provide Clear Feedback

- Show appropriate error messages
- Include retry mechanisms for failed operations

### 5. Test Edge Cases

- Test with slow network connections
- Test with expired tokens
- Test with invalid authentication states

This route protection system provides a robust, secure, and user-friendly way to protect all feature routes while maintaining a smooth user experience.
