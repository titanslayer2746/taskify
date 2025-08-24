// Logout Utility Service
// Provides comprehensive logout functionality with different strategies

import {
  tokenStorage,
  userStorage,
  refreshTokenStorage,
  authUtils,
} from "./storage";
import { tokenRefreshService } from "./token-refresh";
import { apiService } from "./api";

// Logout options interface
export interface LogoutOptions {
  callApi?: boolean;
  redirectTo?: string;
  clearLocalData?: boolean;
  showNotification?: boolean;
  clearCache?: boolean;
  clearSession?: boolean;
  reason?: string;
}

// Logout result interface
export interface LogoutResult {
  success: boolean;
  message: string;
  error?: string;
  timestamp: Date;
}

// Logout strategy types
export type LogoutStrategy =
  | "normal"
  | "force"
  | "all-devices"
  | "session-only"
  | "cache-only"
  | "silent";

// Logout service class
class LogoutService {
  private isLoggingOut = false;

  /**
   * Perform a comprehensive logout
   */
  async logout(options: LogoutOptions = {}): Promise<LogoutResult> {
    const {
      callApi = true,
      redirectTo = "/signin",
      clearLocalData = true,
      showNotification = true,
      clearCache = true,
      clearSession = true,
      reason = "User initiated logout",
    } = options;

    if (this.isLoggingOut) {
      return {
        success: false,
        message: "Logout already in progress",
        timestamp: new Date(),
      };
    }

    this.isLoggingOut = true;
    const startTime = Date.now();

    try {
      // Step 1: Call logout API if requested
      if (callApi) {
        await this.callLogoutAPI();
      }

      // Step 2: Stop token refresh service
      this.stopTokenRefresh();

      // Step 3: Clear authentication data
      if (clearLocalData) {
        this.clearAuthData();
      }

      // Step 4: Clear cache if requested
      if (clearCache) {
        await this.clearCache();
      }

      // Step 5: Clear session data if requested
      if (clearSession) {
        this.clearSessionData();
      }

      // Step 6: Redirect if specified
      if (redirectTo) {
        this.redirect(redirectTo);
      }

      const result: LogoutResult = {
        success: true,
        message: "Logout completed successfully",
        timestamp: new Date(),
      };

      if (showNotification) {
        console.log(`Logout completed in ${Date.now() - startTime}ms`);
      }

      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      // Even if there's an error, ensure user is logged out locally
      try {
        this.stopTokenRefresh();
        this.clearAuthData();
        this.redirect(redirectTo);
      } catch (fallbackError) {
        console.error("Fallback logout failed:", fallbackError);
      }

      return {
        success: false,
        message: "Logout failed",
        error: errorMessage,
        timestamp: new Date(),
      };
    } finally {
      this.isLoggingOut = false;
    }
  }

  /**
   * Force logout without API call
   */
  async forceLogout(reason?: string): Promise<LogoutResult> {
    return this.logout({
      callApi: false,
      redirectTo: "/signin",
      clearLocalData: true,
      showNotification: false,
      clearCache: true,
      clearSession: true,
      reason: reason || "Force logout",
    });
  }

  /**
   * Logout from all devices
   */
  async logoutFromAllDevices(): Promise<LogoutResult> {
    try {
      // Call logout from all devices API
      await apiService.logoutFromAllDevices();

      // Perform local logout
      return this.logout({
        callApi: false, // Already called above
        redirectTo: "/signin",
        clearLocalData: true,
        showNotification: true,
        clearCache: true,
        clearSession: true,
        reason: "Logout from all devices",
      });
    } catch (error) {
      console.error("Logout from all devices failed:", error);

      // Fallback to regular logout
      return this.logout({
        callApi: false,
        redirectTo: "/signin",
        clearLocalData: true,
        showNotification: true,
        clearCache: true,
        clearSession: true,
        reason: "Logout from all devices (fallback)",
      });
    }
  }

  /**
   * Session-only logout (keep cache)
   */
  async sessionOnlyLogout(): Promise<LogoutResult> {
    return this.logout({
      callApi: true,
      redirectTo: "/signin",
      clearLocalData: true,
      showNotification: true,
      clearCache: false,
      clearSession: true,
      reason: "Session-only logout",
    });
  }

  /**
   * Cache-only logout (keep session)
   */
  async cacheOnlyLogout(): Promise<LogoutResult> {
    return this.logout({
      callApi: false,
      redirectTo: "/signin",
      clearLocalData: false,
      showNotification: false,
      clearCache: true,
      clearSession: false,
      reason: "Cache-only logout",
    });
  }

  /**
   * Silent logout (no notifications or redirects)
   */
  async silentLogout(): Promise<LogoutResult> {
    return this.logout({
      callApi: true,
      redirectTo: "",
      clearLocalData: true,
      showNotification: false,
      clearCache: true,
      clearSession: true,
      reason: "Silent logout",
    });
  }

  /**
   * Logout with specific strategy
   */
  async logoutWithStrategy(
    strategy: LogoutStrategy,
    options: Partial<LogoutOptions> = {}
  ): Promise<LogoutResult> {
    switch (strategy) {
      case "normal":
        return this.logout(options);
      case "force":
        return this.forceLogout(options.reason);
      case "all-devices":
        return this.logoutFromAllDevices();
      case "session-only":
        return this.sessionOnlyLogout();
      case "cache-only":
        return this.cacheOnlyLogout();
      case "silent":
        return this.silentLogout();
      default:
        return this.logout(options);
    }
  }

  /**
   * Check if logout is in progress
   */
  isLogoutInProgress(): boolean {
    return this.isLoggingOut;
  }

  /**
   * Get logout status
   */
  getLogoutStatus(): {
    isLoggingOut: boolean;
    lastLogoutTime?: Date;
  } {
    return {
      isLoggingOut: this.isLoggingOut,
      lastLogoutTime: this.lastLogoutTime,
    };
  }

  // Private methods

  private lastLogoutTime?: Date;

  private async callLogoutAPI(): Promise<void> {
    try {
      await apiService.logout();
    } catch (error) {
      console.warn("Logout API call failed:", error);
      // Don't throw error, continue with local logout
    }
  }

  private stopTokenRefresh(): void {
    try {
      tokenRefreshService.stop();
    } catch (error) {
      console.warn("Failed to stop token refresh:", error);
    }
  }

  private clearAuthData(): void {
    try {
      authUtils.secureLogout();
    } catch (error) {
      console.warn("Failed to clear auth data:", error);
    }
  }

  private async clearCache(): Promise<void> {
    try {
      if (typeof window !== "undefined" && window.caches) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      }
    } catch (error) {
      console.warn("Failed to clear cache:", error);
    }
  }

  private clearSessionData(): void {
    try {
      // Clear any stored user preferences
      localStorage.removeItem("user_preferences");
      localStorage.removeItem("app_settings");
      localStorage.removeItem("theme_preference");
      localStorage.removeItem("language_preference");

      // Clear session storage
      sessionStorage.clear();

      // Clear any other app-specific data
      const keysToRemove = [
        "last_activity",
        "user_session",
        "app_state",
        "form_data",
        "notifications",
      ];

      keysToRemove.forEach((key) => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      });
    } catch (error) {
      console.warn("Failed to clear session data:", error);
    }
  }

  private redirect(url: string): void {
    if (url && typeof window !== "undefined") {
      // Use replace to prevent back button from returning to authenticated pages
      window.location.replace(url);
    }
  }
}

// Create and export logout service instance
export const logoutService = new LogoutService();

// Export utility functions for common logout scenarios
export const logoutUtils = {
  /**
   * Quick logout with default settings
   */
  quickLogout: () => logoutService.logout(),

  /**
   * Secure logout with full cleanup
   */
  secureLogout: () =>
    logoutService.logout({
      callApi: true,
      redirectTo: "/signin",
      clearLocalData: true,
      showNotification: true,
      clearCache: true,
      clearSession: true,
    }),

  /**
   * Emergency logout (no API call)
   */
  emergencyLogout: () => logoutService.forceLogout("Emergency logout"),

  /**
   * Logout for security reasons
   */
  securityLogout: (reason: string) =>
    logoutService.forceLogout(`Security: ${reason}`),

  /**
   * Logout for maintenance
   */
  maintenanceLogout: () =>
    logoutService.logout({
      callApi: true,
      redirectTo: "/maintenance",
      clearLocalData: true,
      showNotification: true,
      clearCache: true,
      clearSession: true,
      reason: "System maintenance",
    }),

  /**
   * Logout for account deletion
   */
  accountDeletionLogout: () =>
    logoutService.logout({
      callApi: true,
      redirectTo: "/account-deleted",
      clearLocalData: true,
      showNotification: true,
      clearCache: true,
      clearSession: true,
      reason: "Account deletion",
    }),
};

// Export types
export type { LogoutOptions, LogoutResult, LogoutStrategy };
