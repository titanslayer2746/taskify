// Authentication Context and Provider for React Application

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from "react";
import { User, AuthResponse } from "../services/types";
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
import { apiService } from "../services/api";

// Authentication state interface
interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
}

// Authentication actions interface
interface AuthActions {
  login: (authData: AuthResponse) => Promise<void>;
  logout: (options?: {
    callApi?: boolean;
    redirectTo?: string;
    clearLocalData?: boolean;
    showNotification?: boolean;
  }) => Promise<void>;
  forceLogout: (reason?: string) => Promise<void>;
  logoutFromAllDevices: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  refreshToken: () => Promise<boolean>;
  clearError: () => void;
  initialize: () => Promise<void>;
}

// Context interface
interface AuthContextType extends AuthState, AuthActions {
  // Additional utility methods
  getAuthStatus: () => ReturnType<typeof authUtils.getAuthStatus>;
  getRefreshStatus: () => ReturnType<
    typeof tokenRefreshService.getRefreshStatus
  >;
  isTokenExpired: () => boolean;
  isTokenExpiringSoon: () => boolean;
  getTokenTTL: () => number;
}

// Action types for reducer
type AuthAction =
  | { type: "INIT_START" }
  | {
      type: "INIT_SUCCESS";
      payload: { user: User | null; token: string | null };
    }
  | { type: "INIT_FAILURE"; payload: string }
  | { type: "LOGIN_START" }
  | { type: "LOGIN_SUCCESS"; payload: { user: User; token: string } }
  | { type: "LOGIN_FAILURE"; payload: string }
  | { type: "LOGOUT" }
  | { type: "UPDATE_USER"; payload: User }
  | { type: "REFRESH_TOKEN_START" }
  | { type: "REFRESH_TOKEN_SUCCESS"; payload: string }
  | { type: "REFRESH_TOKEN_FAILURE"; payload: string }
  | { type: "CLEAR_ERROR" }
  | { type: "SET_LOADING"; payload: boolean };

// Initial state
const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
  isLoading: true,
  error: null,
  isInitialized: false,
};

// Reducer function
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "INIT_START":
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case "INIT_SUCCESS":
      return {
        ...state,
        isAuthenticated: !!action.payload.user && !!action.payload.token,
        user: action.payload.user,
        token: action.payload.token,
        isLoading: false,
        error: null,
        isInitialized: true,
      };

    case "INIT_FAILURE":
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        isLoading: false,
        error: action.payload,
        isInitialized: true,
      };

    case "LOGIN_START":
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case "LOGIN_SUCCESS":
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        isLoading: false,
        error: null,
      };

    case "LOGIN_FAILURE":
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        isLoading: false,
        error: action.payload,
      };

    case "LOGOUT":
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        isLoading: false,
        error: null,
      };

    case "UPDATE_USER":
      return {
        ...state,
        user: action.payload,
      };

    case "REFRESH_TOKEN_START":
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case "REFRESH_TOKEN_SUCCESS":
      return {
        ...state,
        token: action.payload,
        isLoading: false,
        error: null,
      };

    case "REFRESH_TOKEN_FAILURE":
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };

    case "CLEAR_ERROR":
      return {
        ...state,
        error: null,
      };

    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      };

    default:
      return state;
  }
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider props interface
interface AuthProviderProps {
  children: ReactNode;
  onAuthStateChange?: (isAuthenticated: boolean, user: User | null) => void;
  autoRefresh?: boolean;
  refreshThreshold?: number;
}

// Provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({
  children,
  onAuthStateChange,
  autoRefresh = true,
  refreshThreshold = 300,
}) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize authentication state
  const initialize = async (): Promise<void> => {
    try {
      dispatch({ type: "INIT_START" });

      // Get stored authentication data
      const token = tokenStorage.getToken();
      const user = userStorage.getUser();
      const refreshToken = refreshTokenStorage.getRefreshToken();

      // Validate authentication state
      const authState = authUtils.validateAuthState();

      if (authState.isValid && token && user) {
        // User is authenticated
        dispatch({
          type: "INIT_SUCCESS",
          payload: { user, token },
        });

        // Initialize token refresh service
        if (autoRefresh) {
          tokenRefreshUtils.initialize({
            autoRefresh: true,
            refreshThreshold,
          });
        }

        // Call auth state change callback
        onAuthStateChange?.(true, user);
      } else {
        // User is not authenticated or tokens are invalid
        dispatch({
          type: "INIT_SUCCESS",
          payload: { user: null, token: null },
        });

        // Clear any invalid data
        if (token || user || refreshToken) {
          authUtils.secureLogout();
        }

        // Call auth state change callback
        onAuthStateChange?.(false, null);
      }
    } catch (error) {
      console.error("Auth initialization error:", error);
      dispatch({
        type: "INIT_FAILURE",
        payload: "Failed to initialize authentication",
      });
      onAuthStateChange?.(false, null);
    }
  };

  // Login function
  const login = async (authData: AuthResponse): Promise<void> => {
    try {
      dispatch({ type: "LOGIN_START" });

      // Store authentication data
      authUtils.storeAuthData(
        authData.token,
        authData.refreshToken || "",
        authData.user
      );

      // Initialize token refresh service
      if (autoRefresh) {
        tokenRefreshUtils.initialize({
          autoRefresh: true,
          refreshThreshold,
        });
      }

      dispatch({
        type: "LOGIN_SUCCESS",
        payload: { user: authData.user, token: authData.token },
      });

      // Call auth state change callback
      onAuthStateChange?.(true, authData.user);

      console.log("User logged in successfully");
    } catch (error) {
      console.error("Login error:", error);
      dispatch({
        type: "LOGIN_FAILURE",
        payload: "Login failed. Please try again.",
      });
    }
  };

  // Logout function
  const logout = async (
    options: {
      callApi?: boolean;
      redirectTo?: string;
      clearLocalData?: boolean;
      showNotification?: boolean;
    } = {}
  ): Promise<void> => {
    const {
      callApi = true,
      redirectTo = "/signin",
      clearLocalData = true,
      showNotification = true,
    } = options;

    try {
      dispatch({ type: "SET_LOADING", payload: true });

      // Call logout API if requested
      if (callApi && state.token) {
        try {
          await apiService.logout();
          if (showNotification) {
            console.log("Logout API call successful");
          }
        } catch (apiError) {
          console.warn(
            "Logout API call failed, continuing with local logout:",
            apiError
          );
          // Continue with local logout even if API call fails
        }
      }

      // Stop token refresh service
      tokenRefreshService.stop();

      // Clear all auth data
      if (clearLocalData) {
        authUtils.secureLogout();
      }

      // Clear any cached data or user preferences
      try {
        // Clear any cached API responses
        if (typeof window !== "undefined" && window.caches) {
          const cacheNames = await caches.keys();
          await Promise.all(
            cacheNames.map((cacheName) => caches.delete(cacheName))
          );
        }

        // Clear any stored user preferences
        localStorage.removeItem("user_preferences");
        localStorage.removeItem("app_settings");
        sessionStorage.clear();
      } catch (cacheError) {
        console.warn("Failed to clear cache:", cacheError);
      }

      // Update state
      dispatch({ type: "LOGOUT" });

      // Call auth state change callback
      onAuthStateChange?.(false, null);

      // Show notification if requested
      if (showNotification) {
        console.log("User logged out successfully");
      }

      // Redirect if specified
      if (redirectTo && typeof window !== "undefined") {
        // Use replace to prevent back button from returning to authenticated pages
        window.location.replace(redirectTo);
      }
    } catch (error) {
      console.error("Logout error:", error);

      // Even if there's an error, ensure user is logged out locally
      try {
        tokenRefreshService.stop();
        authUtils.secureLogout();
        dispatch({ type: "LOGOUT" });
        onAuthStateChange?.(false, null);

        if (redirectTo && typeof window !== "undefined") {
          window.location.replace(redirectTo);
        }
      } catch (fallbackError) {
        console.error("Fallback logout failed:", fallbackError);
      }
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  // Force logout (for security purposes)
  const forceLogout = async (reason?: string): Promise<void> => {
    console.warn("Force logout initiated", reason ? `Reason: ${reason}` : "");

    await logout({
      callApi: false, // Don't call API for force logout
      redirectTo: "/signin",
      clearLocalData: true,
      showNotification: false,
    });
  };

  // Logout from all devices
  const logoutFromAllDevices = async (): Promise<void> => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });

      // Call logout from all devices API
      await apiService.logoutFromAllDevices();

      // Perform local logout
      await logout({
        callApi: false, // Already called above
        redirectTo: "/signin",
        clearLocalData: true,
        showNotification: true,
      });
    } catch (error) {
      console.error("Logout from all devices failed:", error);
      // Fallback to regular logout
      await logout({
        callApi: false,
        redirectTo: "/signin",
        clearLocalData: true,
        showNotification: true,
      });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  // Update user function
  const updateUser = (updates: Partial<User>): void => {
    try {
      userStorage.updateUser(updates);
      const updatedUser = userStorage.getUser();

      if (updatedUser) {
        dispatch({ type: "UPDATE_USER", payload: updatedUser });
      }
    } catch (error) {
      console.error("Update user error:", error);
      dispatch({
        type: "CLEAR_ERROR",
      });
    }
  };

  // Refresh token function
  const refreshToken = async (): Promise<boolean> => {
    try {
      dispatch({ type: "REFRESH_TOKEN_START" });

      const success = await tokenRefreshUtils.forceRefresh();

      if (success) {
        const newToken = tokenStorage.getToken();
        if (newToken) {
          dispatch({
            type: "REFRESH_TOKEN_SUCCESS",
            payload: newToken,
          });
          return true;
        }
      }

      dispatch({
        type: "REFRESH_TOKEN_FAILURE",
        payload: "Token refresh failed.",
      });
      return false;
    } catch (error) {
      console.error("Token refresh error:", error);
      dispatch({
        type: "REFRESH_TOKEN_FAILURE",
        payload: "Token refresh failed.",
      });
      return false;
    }
  };

  // Clear error function
  const clearError = (): void => {
    dispatch({ type: "CLEAR_ERROR" });
  };

  // Utility functions
  const getAuthStatus = () => {
    return authUtils.getAuthStatus();
  };

  const getRefreshStatus = () => {
    return tokenRefreshService.getRefreshStatus();
  };

  const isTokenExpired = () => {
    return tokenStorage.isTokenExpired();
  };

  const isTokenExpiringSoon = () => {
    return authUtils.isTokenExpiringSoon();
  };

  const getTokenTTL = () => {
    return tokenStorage.getTokenTTL();
  };

  // Initialize on mount
  useEffect(() => {
    initialize();
  }, []);

  // Set up periodic auth state checks
  useEffect(() => {
    if (!state.isAuthenticated) return;

    const checkAuthState = () => {
      const validation = authUtils.validateAuthState();

      if (!validation.isValid) {
        // Token is invalid, logout user
        logout();
        return;
      }

      // Update state if needed
      const currentToken = tokenStorage.getToken();
      const currentUser = userStorage.getUser();

      if (currentToken !== state.token || currentUser?.id !== state.user?.id) {
        dispatch({
          type: "INIT_SUCCESS",
          payload: { user: currentUser, token: currentToken },
        });
      }
    };

    // Check auth state every minute
    const interval = setInterval(checkAuthState, 60000);

    return () => clearInterval(interval);
  }, [state.isAuthenticated, state.token, state.user?.id]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      tokenRefreshService.stop();
    };
  }, []);

  // Context value
  const contextValue: AuthContextType = {
    ...state,
    login,
    logout,
    forceLogout,
    logoutFromAllDevices,
    updateUser,
    refreshToken,
    clearError,
    initialize,
    getAuthStatus,
    getRefreshStatus,
    isTokenExpired,
    isTokenExpiringSoon,
    getTokenTTL,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Specialized hooks for specific use cases
export const useIsAuthenticated = (): boolean => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated;
};

export const useCurrentUser = (): User | null => {
  const { user } = useAuth();
  return user;
};

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

export const useAuthStatus = () => {
  const { getAuthStatus, getRefreshStatus } = useAuth();

  return {
    authStatus: getAuthStatus(),
    refreshStatus: getRefreshStatus(),
  };
};

export const useAuthActions = () => {
  const {
    login,
    logout,
    forceLogout,
    logoutFromAllDevices,
    updateUser,
    refreshToken,
    clearError,
  } = useAuth();

  return {
    login,
    logout,
    forceLogout,
    logoutFromAllDevices,
    updateUser,
    refreshToken,
    clearError,
  };
};

export const useAuthState = () => {
  const { isAuthenticated, user, token, isLoading, error, isInitialized } =
    useAuth();

  return {
    isAuthenticated,
    user,
    token,
    isLoading,
    error,
    isInitialized,
  };
};

// Higher-order component for protected routes
export const withAuth = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ComponentType
) => {
  return (props: P) => {
    const { isAuthenticated, isLoading, isInitialized } = useAuth();

    if (!isInitialized || isLoading) {
      return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
      const FallbackComponent = fallback;
      return FallbackComponent ? (
        <FallbackComponent />
      ) : (
        <div>Please log in to access this page.</div>
      );
    }

    return <Component {...props} />;
  };
};

// Export types
export type { AuthContextType, AuthState, AuthActions };
