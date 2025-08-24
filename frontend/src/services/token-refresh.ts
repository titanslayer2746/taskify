// Enhanced Token Refresh Service for automatic JWT token renewal

import { httpClient } from "./http-client";
import {
  tokenStorage,
  refreshTokenStorage,
  userStorage,
  authUtils,
} from "./storage";
import { RefreshTokenResponse, AuthResponse } from "./types";

// Token refresh configuration
interface TokenRefreshConfig {
  autoRefresh: boolean;
  refreshThreshold: number; // seconds before expiry to refresh
  maxRetries: number;
  retryDelay: number; // milliseconds
  refreshEndpoint: string;
  backgroundRefresh: boolean; // Enable background refresh when tab is hidden
  networkRetry: boolean; // Retry on network reconnection
  silentRefresh: boolean; // Refresh without user notification
}

// Default configuration
const defaultConfig: TokenRefreshConfig = {
  autoRefresh: true,
  refreshThreshold: 300, // 5 minutes
  maxRetries: 3,
  retryDelay: 1000,
  refreshEndpoint: "/users/refresh-token",
  backgroundRefresh: true,
  networkRetry: true,
  silentRefresh: true,
};

// Network status interface
interface NetworkStatus {
  isOnline: boolean;
  wasOffline: boolean;
  lastOnlineTime: number;
}

// Enhanced token refresh service
class TokenRefreshService {
  private config: TokenRefreshConfig;
  private isRefreshing = false;
  private refreshPromise: Promise<boolean> | null = null;
  private retryCount = 0;
  private refreshTimer: NodeJS.Timeout | null = null;
  private backgroundRefreshTimer: NodeJS.Timeout | null = null;
  private networkStatus: NetworkStatus = {
    isOnline: navigator.onLine,
    wasOffline: false,
    lastOnlineTime: Date.now(),
  };
  private refreshCallbacks: Array<(success: boolean) => void> = [];
  private isInitialized = false;

  constructor(config: Partial<TokenRefreshConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
    this.setupNetworkMonitoring();
    this.setupVisibilityChangeMonitoring();
  }

  // Initialize the token refresh service
  initialize(): void {
    if (this.isInitialized) return;

    this.isInitialized = true;

    if (this.config.autoRefresh) {
      this.scheduleNextRefresh();
    }

    // Check if token needs immediate refresh
    if (this.shouldRefreshImmediately()) {
      this.refreshToken();
    }
  }

  // Check if token should be refreshed immediately
  private shouldRefreshImmediately(): boolean {
    const ttl = tokenStorage.getTokenTTL();
    return ttl > 0 && ttl < this.config.refreshThreshold;
  }

  // Setup network status monitoring
  private setupNetworkMonitoring(): void {
    if (!this.config.networkRetry) return;

    const handleOnline = () => {
      this.networkStatus.isOnline = true;
      this.networkStatus.lastOnlineTime = Date.now();

      if (this.networkStatus.wasOffline) {
        console.log("Network reconnected, checking token refresh...");
        this.networkStatus.wasOffline = false;

        // Check if token needs refresh after network reconnection
        if (this.shouldRefreshImmediately()) {
          this.refreshToken();
        }
      }
    };

    const handleOffline = () => {
      this.networkStatus.isOnline = false;
      this.networkStatus.wasOffline = true;
      console.log("Network disconnected, pausing token refresh...");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
  }

  // Setup visibility change monitoring for background refresh
  private setupVisibilityChangeMonitoring(): void {
    if (!this.config.backgroundRefresh) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab is hidden, schedule background refresh
        this.scheduleBackgroundRefresh();
      } else {
        // Tab is visible, check if refresh is needed
        if (this.shouldRefreshImmediately()) {
          this.refreshToken();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
  }

  // Schedule background refresh when tab is hidden
  private scheduleBackgroundRefresh(): void {
    if (this.backgroundRefreshTimer) {
      clearTimeout(this.backgroundRefreshTimer);
    }

    const ttl = tokenStorage.getTokenTTL();
    if (ttl <= 0) return;

    // Refresh when token is about to expire
    const refreshTime = Math.max(0, (ttl - 60) * 1000); // 1 minute before expiry

    this.backgroundRefreshTimer = setTimeout(() => {
      if (document.hidden) {
        this.refreshToken();
      }
    }, refreshTime);
  }

  // Schedule the next token refresh
  private scheduleNextRefresh(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    const ttl = tokenStorage.getTokenTTL();
    if (ttl <= 0) {
      console.warn("Token has expired, cannot schedule refresh");
      return;
    }

    const refreshTime = Math.max(
      0,
      (ttl - this.config.refreshThreshold) * 1000
    );

    this.refreshTimer = setTimeout(() => {
      this.refreshToken();
    }, refreshTime);

    console.log(
      `Token refresh scheduled in ${Math.floor(refreshTime / 1000)} seconds`
    );
  }

  // Refresh the access token using refresh token
  async refreshToken(): Promise<boolean> {
    // Prevent multiple simultaneous refresh attempts
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    // Check network status
    if (!this.networkStatus.isOnline) {
      console.warn("Network is offline, skipping token refresh");
      return false;
    }

    this.isRefreshing = true;
    this.refreshPromise = this.performRefresh();

    try {
      const result = await this.refreshPromise;

      // Notify callbacks
      this.refreshCallbacks.forEach((callback) => callback(result));

      return result;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  // Perform the actual token refresh
  private async performRefresh(): Promise<boolean> {
    try {
      const refreshToken = refreshTokenStorage.getRefreshToken();
      if (!refreshToken) {
        console.error("No refresh token available");
        return false;
      }

      if (refreshTokenStorage.isRefreshTokenExpired()) {
        console.error("Refresh token has expired");
        this.handleRefreshFailure();
        return false;
      }

      if (!this.config.silentRefresh) {
        console.log("Refreshing access token...");
      }

      const response = await httpClient.post<RefreshTokenResponse>(
        this.config.refreshEndpoint,
        { refreshToken }
      );

      if (response && response.token) {
        // Update the access token
        tokenStorage.setToken(response.token);

        // Update refresh token if provided
        if (response.refreshToken) {
          refreshTokenStorage.setRefreshToken(response.refreshToken);
        }

        // Reset retry count on successful refresh
        this.retryCount = 0;

        // Schedule next refresh
        if (this.config.autoRefresh) {
          this.scheduleNextRefresh();
        }

        if (!this.config.silentRefresh) {
          console.log("Token refreshed successfully");
        }
        return true;
      } else {
        throw new Error("Invalid refresh response");
      }
    } catch (error) {
      console.error("Token refresh failed:", error);
      return this.handleRefreshError(error);
    }
  }

  // Handle refresh errors with retry logic
  private async handleRefreshError(error: any): Promise<boolean> {
    this.retryCount++;

    if (this.retryCount <= this.config.maxRetries) {
      console.log(
        `Retrying token refresh (${this.retryCount}/${this.config.maxRetries})...`
      );

      // Exponential backoff
      const delay = this.config.retryDelay * Math.pow(2, this.retryCount - 1);
      await new Promise((resolve) => setTimeout(resolve, delay));

      // Retry the refresh
      return this.performRefresh();
    } else {
      console.error("Max retry attempts reached for token refresh");
      this.handleRefreshFailure();
      return false;
    }
  }

  // Handle complete refresh failure
  private handleRefreshFailure(): void {
    console.error("Token refresh failed completely, logging out user");

    // Clear all authentication data
    authUtils.secureLogout();

    // Redirect to login page
    if (typeof window !== "undefined") {
      window.location.href = "/signin";
    }
  }

  // Force refresh token (for manual refresh)
  async forceRefresh(): Promise<boolean> {
    this.retryCount = 0;
    return this.refreshToken();
  }

  // Check if token needs refresh
  needsRefresh(): boolean {
    return tokenStorage.needsRefresh();
  }

  // Get refresh status
  getRefreshStatus(): {
    isRefreshing: boolean;
    retryCount: number;
    nextRefreshIn: number | null;
    canRefresh: boolean;
    networkStatus: NetworkStatus;
    isInitialized: boolean;
  } {
    const ttl = tokenStorage.getTokenTTL();
    const nextRefreshIn =
      ttl > this.config.refreshThreshold
        ? ttl - this.config.refreshThreshold
        : null;

    return {
      isRefreshing: this.isRefreshing,
      retryCount: this.retryCount,
      nextRefreshIn,
      canRefresh:
        refreshTokenStorage.hasRefreshToken() &&
        !refreshTokenStorage.isRefreshTokenExpired() &&
        this.networkStatus.isOnline,
      networkStatus: { ...this.networkStatus },
      isInitialized: this.isInitialized,
    };
  }

  // Add refresh callback
  onRefresh(callback: (success: boolean) => void): () => void {
    this.refreshCallbacks.push(callback);

    // Return unsubscribe function
    return () => {
      const index = this.refreshCallbacks.indexOf(callback);
      if (index > -1) {
        this.refreshCallbacks.splice(index, 1);
      }
    };
  }

  // Stop the refresh service
  stop(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }

    if (this.backgroundRefreshTimer) {
      clearTimeout(this.backgroundRefreshTimer);
      this.backgroundRefreshTimer = null;
    }

    this.isRefreshing = false;
    this.refreshPromise = null;
    this.retryCount = 0;
    this.isInitialized = false;
    this.refreshCallbacks = [];
  }

  // Update configuration
  updateConfig(newConfig: Partial<TokenRefreshConfig>): void {
    this.config = { ...this.config, ...newConfig };

    // Restart the service if auto-refresh is enabled
    if (this.config.autoRefresh && this.isInitialized) {
      this.scheduleNextRefresh();
    } else if (!this.config.autoRefresh) {
      this.stop();
    }
  }

  // Get current configuration
  getConfig(): TokenRefreshConfig {
    return { ...this.config };
  }

  // Get network status
  getNetworkStatus(): NetworkStatus {
    return { ...this.networkStatus };
  }
}

// Create and export the token refresh service instance
export const tokenRefreshService = new TokenRefreshService();

// Export the class for testing
export { TokenRefreshService };

// Utility functions for token refresh
export const tokenRefreshUtils = {
  // Initialize token refresh service
  initialize: (config?: Partial<TokenRefreshConfig>): void => {
    if (config) {
      tokenRefreshService.updateConfig(config);
    }
    tokenRefreshService.initialize();
  },

  // Check if token refresh is needed and perform if necessary
  checkAndRefresh: async (): Promise<boolean> => {
    if (tokenRefreshService.needsRefresh()) {
      return await tokenRefreshService.refreshToken();
    }
    return true;
  },

  // Force token refresh
  forceRefresh: async (): Promise<boolean> => {
    return await tokenRefreshService.forceRefresh();
  },

  // Get refresh status
  getStatus: () => {
    return tokenRefreshService.getRefreshStatus();
  },

  // Stop token refresh service
  stop: (): void => {
    tokenRefreshService.stop();
  },

  // Update refresh configuration
  updateConfig: (config: Partial<TokenRefreshConfig>): void => {
    tokenRefreshService.updateConfig(config);
  },

  // Get current configuration
  getConfig: (): TokenRefreshConfig => {
    return tokenRefreshService.getConfig();
  },

  // Add refresh callback
  onRefresh: (callback: (success: boolean) => void) => {
    return tokenRefreshService.onRefresh(callback);
  },

  // Get network status
  getNetworkStatus: () => {
    return tokenRefreshService.getNetworkStatus();
  },
};

// Enhanced auto-refresh interceptor for HTTP client
export const createTokenRefreshInterceptor = () => {
  return async (config: RequestInit): Promise<RequestInit> => {
    // Skip refresh for refresh token requests to avoid infinite loops
    if (config.body && typeof config.body === "string") {
      try {
        const body = JSON.parse(config.body);
        if (body.refreshToken) {
          return config;
        }
      } catch {
        // Ignore parsing errors
      }
    }

    // Check if token needs refresh
    if (tokenRefreshService.needsRefresh()) {
      const refreshed = await tokenRefreshService.refreshToken();
      if (!refreshed) {
        throw new Error("Token refresh failed");
      }
    }

    return config;
  };
};

// Background refresh interceptor for when app is in background
export const createBackgroundRefreshInterceptor = () => {
  return async (config: RequestInit): Promise<RequestInit> => {
    // Only refresh in background if explicitly configured
    if (!tokenRefreshService.getConfig().backgroundRefresh) {
      return config;
    }

    // Check if app is in background and token needs refresh
    if (document.hidden && tokenRefreshService.needsRefresh()) {
      await tokenRefreshService.refreshToken();
    }

    return config;
  };
};

// Network-aware refresh interceptor
export const createNetworkAwareRefreshInterceptor = () => {
  return async (config: RequestInit): Promise<RequestInit> => {
    const networkStatus = tokenRefreshService.getNetworkStatus();

    // If network was recently restored, check for token refresh
    if (networkStatus.isOnline && networkStatus.wasOffline) {
      const timeSinceReconnection = Date.now() - networkStatus.lastOnlineTime;

      // Check within 5 seconds of reconnection
      if (timeSinceReconnection < 5000 && tokenRefreshService.needsRefresh()) {
        await tokenRefreshService.refreshToken();
      }
    }

    return config;
  };
};

// Export types
export type { TokenRefreshConfig, NetworkStatus };
