# Automatic Token Refresh Mechanism

This document provides comprehensive documentation for the automatic token refresh mechanism implemented in the Habitty frontend application.

## Table of Contents

1. [Overview](#overview)
2. [Core Features](#core-features)
3. [Configuration](#configuration)
4. [Token Refresh Service](#token-refresh-service)
5. [React Hooks](#react-hooks)
6. [HTTP Interceptors](#http-interceptors)
7. [Usage Examples](#usage-examples)
8. [Advanced Features](#advanced-features)
9. [Best Practices](#best-practices)

## Overview

The automatic token refresh mechanism provides:

- **Proactive token renewal** before expiration
- **Background refresh** when app is in background
- **Network-aware refresh** with offline/online handling
- **Retry logic** with exponential backoff
- **Silent refresh** without user interruption
- **Multiple refresh strategies** for different use cases

## Core Features

### 1. Automatic Refresh

- Refreshes tokens before they expire (configurable threshold)
- Prevents user session interruptions
- Handles token expiration gracefully

### 2. Background Refresh

- Refreshes tokens when app tab is hidden
- Maintains session during background usage
- Optimized for mobile and desktop browsers

### 3. Network Awareness

- Monitors network connectivity
- Pauses refresh when offline
- Resumes refresh when network is restored
- Handles network reconnection scenarios

### 4. Retry Logic

- Exponential backoff for failed attempts
- Configurable retry count and delays
- Graceful failure handling

### 5. Silent Operation

- Refreshes without user notification
- Maintains seamless user experience
- Configurable logging levels

## Configuration

### Token Refresh Configuration

```typescript
interface TokenRefreshConfig {
  autoRefresh: boolean; // Enable automatic refresh
  refreshThreshold: number; // Seconds before expiry to refresh
  maxRetries: number; // Maximum retry attempts
  retryDelay: number; // Delay between retries (ms)
  refreshEndpoint: string; // API endpoint for refresh
  backgroundRefresh: boolean; // Enable background refresh
  networkRetry: boolean; // Retry on network reconnection
  silentRefresh: boolean; // Refresh without user notification
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
  backgroundRefresh: true,
  networkRetry: true,
  silentRefresh: true,
};
```

## Token Refresh Service

### Basic Usage

```typescript
import {
  tokenRefreshService,
  tokenRefreshUtils,
} from "@/services/token-refresh";

// Initialize with default config
tokenRefreshUtils.initialize();

// Initialize with custom config
tokenRefreshUtils.initialize({
  autoRefresh: true,
  refreshThreshold: 600, // 10 minutes
  maxRetries: 5,
  backgroundRefresh: true,
});
```

### Service Methods

```typescript
// Force refresh token
const success = await tokenRefreshUtils.forceRefresh();

// Check if refresh is needed
const needsRefresh = tokenRefreshUtils.checkAndRefresh();

// Get refresh status
const status = tokenRefreshUtils.getStatus();
// Returns: { isRefreshing, retryCount, nextRefreshIn, canRefresh, networkStatus, isInitialized }

// Stop the service
tokenRefreshUtils.stop();

// Update configuration
tokenRefreshUtils.updateConfig({
  refreshThreshold: 600,
  maxRetries: 5,
});

// Get current configuration
const config = tokenRefreshUtils.getConfig();

// Get network status
const networkStatus = tokenRefreshUtils.getNetworkStatus();
// Returns: { isOnline, wasOffline, lastOnlineTime }
```

### Refresh Callbacks

```typescript
// Add refresh callback
const unsubscribe = tokenRefreshUtils.onRefresh((success) => {
  if (success) {
    console.log("Token refreshed successfully");
  } else {
    console.log("Token refresh failed");
  }
});

// Remove callback
unsubscribe();
```

## React Hooks

### Basic Token Refresh Hook

```typescript
import { useTokenRefresh } from "@/hooks/useTokenRefresh";

function MyComponent() {
  const {
    isRefreshing,
    retryCount,
    nextRefreshIn,
    canRefresh,
    networkStatus,
    isInitialized,
    refreshToken,
    forceRefresh,
    stopRefresh,
    updateConfig,
    config,
    needsRefresh,
    getRefreshStatus,
  } = useTokenRefresh({
    autoRefresh: true,
    refreshThreshold: 300,
    maxRetries: 3,
    backgroundRefresh: true,
    networkRetry: true,
    silentRefresh: true,
  });

  // Use the hook
  if (isRefreshing) {
    return <div>Refreshing token...</div>;
  }

  return (
    <div>
      <p>Next refresh in: {nextRefreshIn}s</p>
      <p>Network: {networkStatus.isOnline ? "Online" : "Offline"}</p>
      <button onClick={forceRefresh}>Force Refresh</button>
    </div>
  );
}
```

### Specialized Hooks

#### Auto Token Refresh

```typescript
import { useAutoTokenRefresh } from "@/hooks/useTokenRefresh";

function MyComponent() {
  const { isRefreshing, nextRefreshIn, forceRefresh } =
    useAutoTokenRefresh(true);

  return (
    <div>
      {isRefreshing && <span>Refreshing...</span>}
      <p>Next refresh: {nextRefreshIn}s</p>
    </div>
  );
}
```

#### Manual Token Refresh

```typescript
import { useManualTokenRefresh } from "@/hooks/useTokenRefresh";

function MyComponent() {
  const { refreshToken, isRefreshing } = useManualTokenRefresh();

  const handleRefresh = async () => {
    const success = await refreshToken();
    if (success) {
      console.log("Token refreshed manually");
    }
  };

  return (
    <button onClick={handleRefresh} disabled={isRefreshing}>
      {isRefreshing ? "Refreshing..." : "Refresh Token"}
    </button>
  );
}
```

#### Background Token Refresh

```typescript
import { useBackgroundTokenRefresh } from "@/hooks/useTokenRefresh";

function MyComponent() {
  const { isRefreshing, networkStatus } = useBackgroundTokenRefresh();

  return (
    <div>
      <p>Background refresh: {isRefreshing ? "Active" : "Inactive"}</p>
      <p>Network: {networkStatus.isOnline ? "Online" : "Offline"}</p>
    </div>
  );
}
```

#### Network-Aware Token Refresh

```typescript
import { useNetworkAwareTokenRefresh } from "@/hooks/useTokenRefresh";

function MyComponent() {
  const { networkStatus, forceRefresh } = useNetworkAwareTokenRefresh();

  useEffect(() => {
    if (networkStatus.isOnline && networkStatus.wasOffline) {
      // Network was restored, refresh token
      forceRefresh();
    }
  }, [networkStatus.isOnline, networkStatus.wasOffline, forceRefresh]);

  return (
    <div>
      <p>Network: {networkStatus.isOnline ? "Online" : "Offline"}</p>
    </div>
  );
}
```

#### Token Refresh with Callbacks

```typescript
import { useTokenRefreshWithCallbacks } from "@/hooks/useTokenRefresh";

function MyComponent() {
  const { isRefreshing, forceRefresh } = useTokenRefreshWithCallbacks({
    onRefreshStart: () => {
      console.log("Token refresh started");
    },
    onRefreshSuccess: () => {
      console.log("Token refresh successful");
      showNotification("Token refreshed successfully");
    },
    onRefreshError: (error) => {
      console.error("Token refresh failed:", error);
      showNotification("Token refresh failed", "error");
    },
    onRefreshComplete: (success) => {
      console.log("Token refresh completed:", success);
    },
  });

  return (
    <button onClick={forceRefresh} disabled={isRefreshing}>
      Refresh Token
    </button>
  );
}
```

## HTTP Interceptors

### Basic Token Refresh Interceptor

```typescript
import { createTokenRefreshInterceptor } from "@/services/token-refresh";
import { httpClient } from "@/services/http-client";

// Add interceptor to HTTP client
httpClient.addRequestInterceptor(createTokenRefreshInterceptor());

// Now all requests will automatically refresh tokens when needed
const response = await httpClient.get("/api/protected-endpoint");
```

### Background Refresh Interceptor

```typescript
import { createBackgroundRefreshInterceptor } from "@/services/token-refresh";

// Add background refresh interceptor
httpClient.addRequestInterceptor(createBackgroundRefreshInterceptor());
```

### Network-Aware Refresh Interceptor

```typescript
import { createNetworkAwareRefreshInterceptor } from "@/services/token-refresh";

// Add network-aware refresh interceptor
httpClient.addRequestInterceptor(createNetworkAwareRefreshInterceptor());
```

### Multiple Interceptors

```typescript
import {
  createTokenRefreshInterceptor,
  createBackgroundRefreshInterceptor,
  createNetworkAwareRefreshInterceptor,
} from "@/services/token-refresh";

// Add multiple interceptors
httpClient.addRequestInterceptor(createTokenRefreshInterceptor());
httpClient.addRequestInterceptor(createBackgroundRefreshInterceptor());
httpClient.addRequestInterceptor(createNetworkAwareRefreshInterceptor());
```

## Usage Examples

### Complete App Integration

```typescript
import { AuthProvider } from "@/contexts/AuthContext";
import { useAutoTokenRefresh } from "@/hooks/useTokenRefresh";
import { createTokenRefreshInterceptor } from "@/services/token-refresh";
import { httpClient } from "@/services/http-client";

// Add token refresh interceptor
httpClient.addRequestInterceptor(createTokenRefreshInterceptor());

function App() {
  return (
    <AuthProvider autoRefresh={true} refreshThreshold={300}>
      <AppContent />
    </AuthProvider>
  );
}

function AppContent() {
  // Enable automatic token refresh
  useAutoTokenRefresh(true);

  return <div>{/* Your app content */}</div>;
}
```

### Custom Token Refresh Strategy

```typescript
import { useTokenRefresh } from "@/hooks/useTokenRefresh";

function CustomTokenRefresh() {
  const {
    isRefreshing,
    nextRefreshIn,
    networkStatus,
    forceRefresh,
    updateConfig,
  } = useTokenRefresh({
    autoRefresh: true,
    refreshThreshold: 600, // 10 minutes
    maxRetries: 5,
    retryDelay: 2000,
    backgroundRefresh: true,
    networkRetry: true,
    silentRefresh: false, // Show logs
  });

  // Update config based on network status
  useEffect(() => {
    if (!networkStatus.isOnline) {
      updateConfig({ autoRefresh: false });
    } else {
      updateConfig({ autoRefresh: true });
    }
  }, [networkStatus.isOnline, updateConfig]);

  return (
    <div>
      <h3>Token Refresh Status</h3>
      <p>Refreshing: {isRefreshing ? "Yes" : "No"}</p>
      <p>Next refresh: {nextRefreshIn}s</p>
      <p>Network: {networkStatus.isOnline ? "Online" : "Offline"}</p>
      <button onClick={forceRefresh}>Force Refresh</button>
    </div>
  );
}
```

### Token Refresh Monitoring

```typescript
import { useTokenRefreshStatus } from "@/hooks/useTokenRefresh";

function TokenRefreshMonitor() {
  const {
    isRefreshing,
    retryCount,
    nextRefreshIn,
    canRefresh,
    networkStatus,
    isInitialized,
  } = useTokenRefreshStatus();

  return (
    <div className="token-refresh-monitor">
      <h3>Token Refresh Monitor</h3>
      <div className="status-grid">
        <div>Status: {isInitialized ? "Initialized" : "Initializing"}</div>
        <div>Refreshing: {isRefreshing ? "Yes" : "No"}</div>
        <div>Retry Count: {retryCount}</div>
        <div>Next Refresh: {nextRefreshIn ? `${nextRefreshIn}s` : "N/A"}</div>
        <div>Can Refresh: {canRefresh ? "Yes" : "No"}</div>
        <div>Network: {networkStatus.isOnline ? "Online" : "Offline"}</div>
      </div>
    </div>
  );
}
```

## Advanced Features

### Custom Refresh Endpoint

```typescript
import { tokenRefreshUtils } from "@/services/token-refresh";

// Configure custom refresh endpoint
tokenRefreshUtils.updateConfig({
  refreshEndpoint: "/api/auth/refresh",
});
```

### Exponential Backoff

The retry mechanism uses exponential backoff:

```typescript
// Retry delays: 1s, 2s, 4s, 8s, 16s...
const delay = retryDelay * Math.pow(2, retryCount - 1);
```

### Network Status Monitoring

```typescript
import { tokenRefreshUtils } from "@/services/token-refresh";

// Get network status
const networkStatus = tokenRefreshUtils.getNetworkStatus();
console.log("Network:", networkStatus);
// { isOnline: true, wasOffline: false, lastOnlineTime: 1234567890 }
```

### Refresh Callbacks

```typescript
import { tokenRefreshUtils } from "@/services/token-refresh";

// Add refresh callback
const unsubscribe = tokenRefreshUtils.onRefresh((success) => {
  if (success) {
    // Token refreshed successfully
    analytics.track("token_refresh_success");
  } else {
    // Token refresh failed
    analytics.track("token_refresh_failure");
  }
});

// Remove callback when component unmounts
useEffect(() => {
  return unsubscribe;
}, []);
```

## Best Practices

### 1. Initialize Early

```typescript
// Initialize token refresh service early in your app
function App() {
  useEffect(() => {
    tokenRefreshUtils.initialize({
      autoRefresh: true,
      refreshThreshold: 300,
    });
  }, []);

  return <AppContent />;
}
```

### 2. Handle Network Changes

```typescript
function NetworkAwareComponent() {
  const { networkStatus, forceRefresh } = useNetworkAwareTokenRefresh();

  useEffect(() => {
    if (networkStatus.isOnline && networkStatus.wasOffline) {
      // Network restored, refresh token
      forceRefresh();
    }
  }, [networkStatus.isOnline, networkStatus.wasOffline, forceRefresh]);
}
```

### 3. Monitor Refresh Status

```typescript
function TokenRefreshMonitor() {
  const { isRefreshing, retryCount, nextRefreshIn } = useTokenRefreshStatus();

  useEffect(() => {
    if (retryCount > 0) {
      console.warn(`Token refresh retry attempt ${retryCount}`);
    }
  }, [retryCount]);

  useEffect(() => {
    if (nextRefreshIn && nextRefreshIn < 60) {
      console.log(`Token will refresh in ${nextRefreshIn} seconds`);
    }
  }, [nextRefreshIn]);
}
```

### 4. Graceful Error Handling

```typescript
function TokenRefreshWithErrorHandling() {
  const { forceRefresh } = useTokenRefreshWithCallbacks({
    onRefreshError: (error) => {
      console.error("Token refresh failed:", error);

      // Show user-friendly error message
      showNotification("Session expired. Please log in again.", "error");

      // Redirect to login
      window.location.href = "/login";
    },
  });

  return <button onClick={forceRefresh}>Refresh Token</button>;
}
```

### 5. Background Refresh Optimization

```typescript
function OptimizedBackgroundRefresh() {
  const { updateConfig } = useBackgroundTokenRefresh();

  useEffect(() => {
    // Optimize for background usage
    if (document.hidden) {
      updateConfig({
        refreshThreshold: 600, // 10 minutes for background
        silentRefresh: true,
      });
    } else {
      updateConfig({
        refreshThreshold: 300, // 5 minutes for foreground
        silentRefresh: false,
      });
    }
  }, [updateConfig]);
}
```

### 6. Cleanup on Unmount

```typescript
function MyComponent() {
  const { stopRefresh } = useTokenRefresh();

  useEffect(() => {
    return () => {
      // Cleanup token refresh when component unmounts
      stopRefresh();
    };
  }, [stopRefresh]);
}
```

This automatic token refresh mechanism provides a robust, configurable, and user-friendly way to handle token renewal in your React application.
