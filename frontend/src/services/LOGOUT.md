# Logout Functionality

This document provides comprehensive documentation for the logout functionality implemented in the Habitty frontend application.

## Table of Contents

1. [Overview](#overview)
2. [Logout Strategies](#logout-strategies)
3. [Authentication Context Integration](#authentication-context-integration)
4. [Logout Components](#logout-components)
5. [Logout Service](#logout-service)
6. [React Hooks](#react-hooks)
7. [Usage Examples](#usage-examples)
8. [Best Practices](#best-practices)

## Overview

The logout functionality provides:

- **Multiple logout strategies** for different use cases
- **Comprehensive cleanup** of authentication data, cache, and session
- **API integration** with backend logout endpoints
- **Error handling** with fallback mechanisms
- **Security features** like force logout and logout from all devices
- **React components** and hooks for easy integration

## Logout Strategies

### 1. Normal Logout

- Calls logout API
- Clears all local data
- Redirects to signin page
- Shows notifications

### 2. Force Logout

- No API call (for security/emergency)
- Immediate local cleanup
- Silent operation

### 3. Logout from All Devices

- Calls logout-all-devices API
- Comprehensive cleanup
- Useful for security concerns

### 4. Session-Only Logout

- Keeps cache intact
- Clears session data
- Good for performance

### 5. Cache-Only Logout

- Clears cache only
- Keeps session data
- Useful for troubleshooting

### 6. Silent Logout

- No notifications or redirects
- Background operation
- Good for automatic logout

## Authentication Context Integration

The logout functionality is integrated into the `AuthContext` with enhanced methods:

```typescript
// Enhanced logout with options
const logout = async (options?: {
  callApi?: boolean;
  redirectTo?: string;
  clearLocalData?: boolean;
  showNotification?: boolean;
}) => Promise<void>;

// Force logout for security
const forceLogout = async (reason?: string) => Promise<void>;

// Logout from all devices
const logoutFromAllDevices = async () => Promise<void>;
```

## Logout Components

### LogoutButton Component

A flexible logout button with multiple options:

```typescript
import { LogoutButton } from '@/components/LogoutButton';

// Simple logout button
<LogoutButton />

// Dropdown with multiple options
<LogoutButton
  showDropdown={true}
  variant="outline"
  onLogout={() => console.log('Logged out')}
/>
```

### LogoutConfirmDialog Component

Confirmation dialog for logout actions:

```typescript
import { LogoutConfirmDialog } from "@/components/LogoutButton";

<LogoutConfirmDialog
  isOpen={showDialog}
  onClose={() => setShowDialog(false)}
  onConfirm={() => console.log("Confirmed")}
  type="logout-all"
  title="Logout from all devices?"
  message="This will log you out from all your devices."
/>;
```

## Logout Service

The `LogoutService` provides comprehensive logout functionality:

```typescript
import { logoutService, logoutUtils } from "@/services/logout";

// Basic logout
await logoutService.logout();

// Force logout
await logoutService.forceLogout("Security breach detected");

// Logout from all devices
await logoutService.logoutFromAllDevices();

// Strategy-based logout
await logoutService.logoutWithStrategy("silent");

// Utility functions
await logoutUtils.secureLogout();
await logoutUtils.emergencyLogout();
await logoutUtils.securityLogout("Suspicious activity");
```

### Service Methods

```typescript
class LogoutService {
  // Main logout method
  async logout(options?: LogoutOptions): Promise<LogoutResult>;

  // Force logout without API call
  async forceLogout(reason?: string): Promise<LogoutResult>;

  // Logout from all devices
  async logoutFromAllDevices(): Promise<LogoutResult>;

  // Session-only logout
  async sessionOnlyLogout(): Promise<LogoutResult>;

  // Cache-only logout
  async cacheOnlyLogout(): Promise<LogoutResult>;

  // Silent logout
  async silentLogout(): Promise<LogoutResult>;

  // Strategy-based logout
  async logoutWithStrategy(
    strategy: LogoutStrategy,
    options?: Partial<LogoutOptions>
  ): Promise<LogoutResult>;

  // Status methods
  isLogoutInProgress(): boolean;
  getLogoutStatus(): { isLoggingOut: boolean; lastLogoutTime?: Date };
}
```

## React Hooks

### useLogout Hook

Provides logout functionality with the authentication context:

```typescript
import { useLogout } from "@/components/LogoutButton";

function MyComponent() {
  const { logout, logoutFromAllDevices, forceLogout, isLoading } = useLogout();

  const handleLogout = async () => {
    await logout({
      callApi: true,
      redirectTo: "/signin",
      clearLocalData: true,
      showNotification: true,
    });
  };

  return (
    <button onClick={handleLogout} disabled={isLoading}>
      Logout
    </button>
  );
}
```

### useAutoLogout Hook

Automatic logout based on inactivity:

```typescript
import { useAutoLogout } from "@/components/LogoutButton";

function App() {
  // Auto logout after 30 minutes of inactivity
  useAutoLogout(30);

  return <AppContent />;
}
```

## Usage Examples

### Basic Integration

```typescript
import { AuthProvider } from "@/contexts/AuthContext";
import { LogoutButton } from "@/components/LogoutButton";

function App() {
  return (
    <AuthProvider>
      <div>
        <header>
          <LogoutButton showDropdown={true} />
        </header>
        <main>{/* App content */}</main>
      </div>
    </AuthProvider>
  );
}
```

### Advanced Logout Handling

```typescript
import { useAuth } from "@/contexts/AuthContext";
import { logoutService } from "@/services/logout";

function SecurityComponent() {
  const { forceLogout } = useAuth();

  const handleSecurityBreach = async () => {
    // Immediate force logout
    await forceLogout("Security breach detected");
  };

  const handleSuspiciousActivity = async () => {
    // Logout from all devices
    await logoutService.logoutFromAllDevices();
  };

  const handleMaintenance = async () => {
    // Maintenance logout
    await logoutService.logout({
      callApi: true,
      redirectTo: "/maintenance",
      reason: "System maintenance",
    });
  };

  return (
    <div>
      <button onClick={handleSecurityBreach}>Emergency Logout</button>
      <button onClick={handleSuspiciousActivity}>Logout All Devices</button>
      <button onClick={handleMaintenance}>Maintenance Logout</button>
    </div>
  );
}
```

### Custom Logout Component

```typescript
import { useLogout } from "@/components/LogoutButton";
import { useState } from "react";

function CustomLogoutComponent() {
  const { logout, logoutFromAllDevices, forceLogout, isLoading } = useLogout();
  const [showConfirm, setShowConfirm] = useState(false);
  const [logoutType, setLogoutType] = useState<
    "normal" | "all-devices" | "force"
  >("normal");

  const handleLogoutClick = (type: typeof logoutType) => {
    setLogoutType(type);
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    try {
      switch (logoutType) {
        case "normal":
          await logout();
          break;
        case "all-devices":
          await logoutFromAllDevices();
          break;
        case "force":
          await forceLogout("User confirmed force logout");
          break;
      }
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setShowConfirm(false);
    }
  };

  return (
    <div>
      <button onClick={() => handleLogoutClick("normal")}>Logout</button>
      <button onClick={() => handleLogoutClick("all-devices")}>
        Logout All Devices
      </button>
      <button onClick={() => handleLogoutClick("force")}>Force Logout</button>

      {showConfirm && (
        <div className="modal">
          <h3>Confirm Logout</h3>
          <p>Are you sure you want to logout?</p>
          <button onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? "Logging out..." : "Confirm"}
          </button>
          <button onClick={() => setShowConfirm(false)}>Cancel</button>
        </div>
      )}
    </div>
  );
}
```

### Session Management

```typescript
import { useAutoLogout } from "@/components/LogoutButton";
import { useEffect } from "react";

function SessionManager() {
  // Auto logout after 60 minutes
  useAutoLogout(60);

  // Custom session tracking
  useEffect(() => {
    const updateLastActivity = () => {
      localStorage.setItem("last_activity", Date.now().toString());
    };

    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
    ];
    events.forEach((event) => {
      document.addEventListener(event, updateLastActivity, true);
    });

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, updateLastActivity, true);
      });
    };
  }, []);

  return null; // This component doesn't render anything
}
```

## Best Practices

### 1. Always Handle Errors

```typescript
const handleLogout = async () => {
  try {
    await logout();
  } catch (error) {
    console.error("Logout failed:", error);
    // Show user-friendly error message
    showNotification("Logout failed. Please try again.", "error");
  }
};
```

### 2. Use Appropriate Logout Strategy

```typescript
// For normal user logout
await logoutService.logout();

// For security concerns
await logoutService.forceLogout("Suspicious activity detected");

// For maintenance
await logoutService.logout({
  redirectTo: "/maintenance",
  reason: "System maintenance",
});
```

### 3. Provide User Feedback

```typescript
const [isLoggingOut, setIsLoggingOut] = useState(false);

const handleLogout = async () => {
  setIsLoggingOut(true);
  try {
    await logout();
    showNotification("Logged out successfully");
  } catch (error) {
    showNotification("Logout failed", "error");
  } finally {
    setIsLoggingOut(false);
  }
};
```

### 4. Implement Auto Logout

```typescript
// In your main App component
function App() {
  // Auto logout after 30 minutes of inactivity
  useAutoLogout(30);

  return <AppContent />;
}
```

### 5. Handle Network Issues

```typescript
const handleLogout = async () => {
  try {
    await logoutService.logout({
      callApi: true,
      redirectTo: "/signin",
    });
  } catch (error) {
    // If API call fails, still logout locally
    await logoutService.forceLogout("Network error");
  }
};
```

### 6. Security Considerations

```typescript
// For sensitive operations, use force logout
const handleSecurityLogout = async () => {
  await logoutService.forceLogout("Security concern");
};

// For account deletion, use comprehensive logout
const handleAccountDeletion = async () => {
  await logoutService.logout({
    callApi: true,
    redirectTo: "/account-deleted",
    clearCache: true,
    clearSession: true,
    reason: "Account deletion",
  });
};
```

This logout functionality provides a robust, secure, and user-friendly way to handle user logout in your React application with multiple strategies for different use cases.
