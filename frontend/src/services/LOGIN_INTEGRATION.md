# Login Integration with Real API

This document explains how the mock login functionality has been replaced with actual API calls to `/api/users/login`.

## Overview

The login functionality has been updated to:

- Use real API calls instead of mock implementations
- Integrate with the authentication context
- Handle various error scenarios
- Provide proper user feedback

## Changes Made

### 1. SignIn Component (`frontend/src/pages/SignIn.tsx`)

**Before (Mock Implementation):**

```typescript
// TODO: Implement actual sign in logic here
// For now, simulate API call
await new Promise((resolve) => setTimeout(resolve, 1500));
navigate("/habits");
```

**After (Real API Implementation):**

```typescript
// Call the actual login API
const response = await apiService.login({
  email: formData.email,
  password: formData.password,
});

// Check if the API call was successful
if (response.success && response.data) {
  // Transform the backend response to match frontend expectations
  const authData = {
    user: response.data.user,
    token: response.data.token,
    refreshToken: response.data.refreshToken,
  };

  // Use the authentication context to handle login
  await login(authData);

  // Navigate to dashboard on success
  navigate("/habits");
}
```

### 2. SignUp Component (`frontend/src/pages/SignUp.tsx`)

**Before (Mock Implementation):**

```typescript
// TODO: Implement actual sign up logic here
// For now, simulate API call
await new Promise((resolve) => setTimeout(resolve, 2000));
navigate("/habits");
```

**After (Real API Implementation):**

```typescript
// Call the actual register API
const response = await apiService.register({
  name: `${formData.firstName} ${formData.lastName}`,
  email: formData.email,
  password: formData.password,
});

// Check if the API call was successful
if (response.success && response.data) {
  // Transform the backend response to match frontend expectations
  const authData = {
    user: response.data.user,
    token: response.data.token,
    refreshToken: response.data.refreshToken,
  };

  // Automatically log in the user after successful registration
  await login(authData);

  // Navigate to dashboard on success
  navigate("/habits");
}
```

### 3. App Component (`frontend/src/App.tsx`)

Added `AuthProvider` wrapper to enable authentication context throughout the app:

```typescript
const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>{/* ... rest of the app */}</TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);
```

### 4. Navbar Component (`frontend/src/components/Navbar.tsx`)

Added user menu with logout functionality:

```typescript
// User Menu with Logout
{
  isAuthenticated && (
    <div className="hidden md:flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-2">
            <User size={18} />
            <span>{user?.name || "User"}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Profile</DropdownMenuItem>
          <DropdownMenuItem>Settings</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <LogoutButton variant="ghost" showDropdown={false} />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
```

## Error Handling

The implementation includes comprehensive error handling:

### HTTP Status Code Handling

```typescript
catch (error: any) {
  if (error.response?.status === 401) {
    setErrors({ general: "Invalid email or password" });
  } else if (error.response?.status === 400) {
    setErrors({ general: error.response.data?.message || "Invalid input" });
  } else if (error.response?.status >= 500) {
    setErrors({ general: "Server error. Please try again later." });
  } else if (error.message === "Network Error") {
    setErrors({ general: "Network error. Please check your connection." });
  } else {
    setErrors({ general: "Login failed. Please try again." });
  }
}
```

### Registration-Specific Errors

```typescript
if (error.response?.status === 409) {
  setErrors({ general: "An account with this email already exists" });
}
```

## API Response Structure

The backend returns:

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "name": "User Name",
      "isActive": true,
      "lastLogin": "2024-01-01T00:00:00.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "jwt_token_here"
  }
}
```

The frontend transforms this to:

```typescript
const authData = {
  user: response.data.user,
  token: response.data.token,
  refreshToken: response.data.refreshToken,
};
```

## Authentication Flow

1. **User submits login form**
2. **Frontend validates form data**
3. **API call to `/api/users/login`**
4. **Backend validates credentials**
5. **Backend returns user data and JWT token**
6. **Frontend transforms response**
7. **Authentication context stores data**
8. **Token refresh service initializes**
9. **User redirected to dashboard**

## Security Features

- **JWT Token Storage**: Secure token storage with metadata
- **Automatic Token Refresh**: Background token renewal
- **Network Error Handling**: Graceful fallback for network issues
- **Input Validation**: Client-side and server-side validation
- **Error Messages**: User-friendly error messages

## Usage Examples

### Basic Login

```typescript
import { useAuth } from "@/contexts/AuthContext";
import { apiService } from "@/services/api";

const { login } = useAuth();

const handleLogin = async (email: string, password: string) => {
  try {
    const response = await apiService.login({ email, password });
    if (response.success && response.data) {
      await login({
        user: response.data.user,
        token: response.data.token,
      });
    }
  } catch (error) {
    console.error("Login failed:", error);
  }
};
```

### Registration with Auto-Login

```typescript
const handleRegister = async (userData: RegisterData) => {
  try {
    const response = await apiService.register(userData);
    if (response.success && response.data) {
      // Automatically log in after registration
      await login({
        user: response.data.user,
        token: response.data.token,
      });
    }
  } catch (error) {
    console.error("Registration failed:", error);
  }
};
```

## Testing

To test the login functionality:

1. **Start the backend server**
2. **Start the frontend development server**
3. **Navigate to `/signin`**
4. **Enter valid credentials**
5. **Verify successful login and redirect**
6. **Check that user menu appears in navbar**
7. **Test logout functionality**

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure backend CORS is properly configured
2. **Network Errors**: Check if backend server is running
3. **Authentication Errors**: Verify JWT_SECRET is set in backend
4. **Token Storage Issues**: Check browser localStorage permissions

### Debug Steps

1. Check browser network tab for API calls
2. Verify backend server logs
3. Check browser console for errors
4. Validate environment variables
5. Test API endpoints directly

This implementation provides a robust, secure, and user-friendly authentication system that integrates seamlessly with the existing application architecture.
