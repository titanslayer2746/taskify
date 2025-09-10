// React hook for managing authentication state with JWT tokens

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  tokenStorage,
  userStorage,
  refreshTokenStorage,
  authUtils,
} from "../services/storage";
import {
  tokenRefreshService,
  tokenRefreshUtils,
} from "../services/token-refresh";
import { User, AuthResponse } from "../services/types";

// Authentication state interface
interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

// Authentication actions interface
interface AuthActions {
  login: (authData: AuthResponse) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  refreshToken: () => Promise<boolean>;
  clearError: () => void;
}

// Hook return type
interface UseAuthReturn extends AuthState, AuthActions {
  // Additional utility methods
  getAuthStatus: () => ReturnType<typeof authUtils.getAuthStatus>;
  getRefreshStatus: () => ReturnType<
    typeof tokenRefreshService.getRefreshStatus
  >;
  isTokenExpired: () => boolean;
  isTokenExpiringSoon: () => boolean;
  getTokenTTL: () => number;
}

// Custom hook for authentication management
export const useAuth = (): UseAuthReturn => {
  // State management
  const [authState, setAuthState] = useState<AuthState>(() => {
    // Initialize state from storage
    const token = tokenStorage.getToken();
    const user = userStorage.getUser();
    const isAuthenticated = authUtils.validateAuthState().isValid;

    return {
      isAuthenticated,
      user,
      token,
      isLoading: false,
      error: null,
    };
  });

  // Initialize token refresh service on mount
  useEffect(() => {
    if (authState.isAuthenticated) {
      tokenRefreshUtils.initialize();
    }

    // Cleanup on unmount
    return () => {
      tokenRefreshService.stop();
    };
  }, [authState.isAuthenticated]);

  // Set up periodic auth state checks
  useEffect(() => {
    if (!authState.isAuthenticated) return;

    const checkAuthState = () => {
      const validation = authUtils.validateAuthState();

      if (!validation.isValid) {
        // Token is invalid, logout user
        logout();
        return;
      }

      // Update state if needed
      setAuthState((prev) => ({
        ...prev,
        isAuthenticated: validation.isValid,
        token: tokenStorage.getToken(),
        user: userStorage.getUser(),
      }));
    };

    // Check auth state every minute
    const interval = setInterval(checkAuthState, 60000);

    return () => clearInterval(interval);
  }, [authState.isAuthenticated]);

  // Login function
  const login = useCallback((authData: AuthResponse) => {
    try {
      // Store authentication data
      authUtils.storeAuthData(
        authData.token,
        authData.refreshToken || "",
        authData.user
      );

      // Update state
      setAuthState({
        isAuthenticated: true,
        user: authData.user,
        token: authData.token,
        isLoading: false,
        error: null,
      });

      // Initialize token refresh
      tokenRefreshUtils.initialize();

      console.log("User logged in successfully");
    } catch (error) {
      console.error("Login error:", error);
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Login failed. Please try again.",
      }));
    }
  }, []);

  // Logout function
  const logout = useCallback(() => {
    try {
      // Stop token refresh service
      tokenRefreshService.stop();

      // Clear all auth data
      authUtils.secureLogout();

      // Update state
      setAuthState({
        isAuthenticated: false,
        user: null,
        token: null,
        isLoading: false,
        error: null,
      });

      console.log("User logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
    }
  }, []);

  // Update user function
  const updateUser = useCallback((updates: Partial<User>) => {
    try {
      userStorage.updateUser(updates);

      setAuthState((prev) => ({
        ...prev,
        user: userStorage.getUser(),
      }));
    } catch (error) {
      console.error("Update user error:", error);
      setAuthState((prev) => ({
        ...prev,
        error: "Failed to update user information.",
      }));
    }
  }, []);

  // Refresh token function
  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

      const success = await tokenRefreshUtils.forceRefresh();

      if (success) {
        setAuthState((prev) => ({
          ...prev,
          token: tokenStorage.getToken(),
          isLoading: false,
        }));
      } else {
        setAuthState((prev) => ({
          ...prev,
          isLoading: false,
          error: "Token refresh failed.",
        }));
      }

      return success;
    } catch (error) {
      console.error("Token refresh error:", error);
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Token refresh failed.",
      }));
      return false;
    }
  }, []);

  // Clear error function
  const clearError = useCallback(() => {
    setAuthState((prev) => ({ ...prev, error: null }));
  }, []);

  // Utility functions
  const getAuthStatus = useCallback(() => {
    return authUtils.getAuthStatus();
  }, []);

  const getRefreshStatus = useCallback(() => {
    return tokenRefreshService.getRefreshStatus();
  }, []);

  const isTokenExpired = useCallback(() => {
    return tokenStorage.isTokenExpired();
  }, []);

  const isTokenExpiringSoon = useCallback(() => {
    return authUtils.isTokenExpiringSoon();
  }, []);

  const getTokenTTL = useCallback(() => {
    return tokenStorage.getTokenTTL();
  }, []);

  // Memoized return value
  const authHook = useMemo(
    () => ({
      ...authState,
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
    }),
    [
      authState,
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
    ]
  );

  return authHook;
};

// Hook for checking if user is authenticated
export const useIsAuthenticated = (): boolean => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated;
};

// Hook for getting current user
export const useCurrentUser = (): User | null => {
  const { user } = useAuth();
  return user;
};

// Hook for token management
export const useToken = () => {
  const {
    token,
    isTokenExpired,
    isTokenExpiringSoon,
    getTokenTTL,
    refreshToken,
  } = useAuth();

  return {
    token,
    isExpired: isTokenExpired(),
    isExpiringSoon: isTokenExpiringSoon(),
    ttl: getTokenTTL(),
    refresh: refreshToken,
  };
};

// Hook for authentication status
export const useAuthStatus = () => {
  const { getAuthStatus, getRefreshStatus } = useAuth();

  return {
    authStatus: getAuthStatus(),
    refreshStatus: getRefreshStatus(),
  };
};

// Hook for authentication actions
export const useAuthActions = () => {
  const { login, logout, updateUser, refreshToken, clearError } = useAuth();

  return {
    login,
    logout,
    updateUser,
    refreshToken,
    clearError,
  };
};

// Hook for authentication state
export const useAuthState = () => {
  const { isAuthenticated, user, token, isLoading, error } = useAuth();

  return {
    isAuthenticated,
    user,
    token,
    isLoading,
    error,
  };
};
