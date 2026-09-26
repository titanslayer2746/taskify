# Automatic Token Refresh Mechanism

This document provides comprehensive documentation for the automatic token refresh mechanism implemented in the Habitty frontend application.

## Table of Contents

1. [Overview](#overview)
2. [Core Features](#core-features)
3. [Configuration](#configuration)
4. [Token Refresh Service](#token-refresh-service)
5. [HTTP Interceptors](#http-interceptors)
6. [Advanced Features](#advanced-features)
7. [Best Practices](#best-practices)

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

### Initialize early

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
