// Enhanced JWT Token Storage and Management

import { User } from "./types";

// Storage keys
const TOKEN_KEY = "habitty_token";
const USER_KEY = "habitty_user";
const REFRESH_TOKEN_KEY = "habitty_refresh_token";
const TOKEN_EXPIRY_KEY = "habitty_token_expiry";
const TOKEN_ISSUED_KEY = "habitty_token_issued";

// JWT Token management with enhanced features
export const tokenStorage = {
  // Get token from storage
  getToken: (): string | null => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.error("Error getting token from storage:", error);
      return null;
    }
  },

  // Set token in storage with metadata
  setToken: (token: string): void => {
    try {
      localStorage.setItem(TOKEN_KEY, token);

      // Store token metadata
      const decoded = tokenStorage.decodeToken(token);
      if (decoded) {
        localStorage.setItem(TOKEN_EXPIRY_KEY, decoded.exp.toString());
        localStorage.setItem(TOKEN_ISSUED_KEY, decoded.iat.toString());
      }
    } catch (error) {
      console.error("Error setting token in storage:", error);
    }
  },

  // Remove token from storage
  removeToken: (): void => {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(TOKEN_EXPIRY_KEY);
      localStorage.removeItem(TOKEN_ISSUED_KEY);
    } catch (error) {
      console.error("Error removing token from storage:", error);
    }
  },

  // Check if token exists
  hasToken: (): boolean => {
    return tokenStorage.getToken() !== null;
  },

  // Check if token is expired
  isTokenExpired: (): boolean => {
    try {
      const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
      if (!expiry) return true;

      const expiryTime = parseInt(expiry) * 1000; // Convert to milliseconds
      const currentTime = Date.now();

      // Consider token expired if it expires within the next 5 minutes
      return currentTime >= expiryTime - 5 * 60 * 1000;
    } catch (error) {
      console.error("Error checking token expiry:", error);
      return true;
    }
  },

  // Get token expiration time
  getTokenExpiry: (): Date | null => {
    try {
      const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
      if (!expiry) return null;

      return new Date(parseInt(expiry) * 1000);
    } catch (error) {
      console.error("Error getting token expiry:", error);
      return null;
    }
  },

  // Get token issued time
  getTokenIssued: (): Date | null => {
    try {
      const issued = localStorage.getItem(TOKEN_ISSUED_KEY);
      if (!issued) return null;

      return new Date(parseInt(issued) * 1000);
    } catch (error) {
      console.error("Error getting token issued time:", error);
      return null;
    }
  },

  // Get token time to live (in seconds)
  getTokenTTL: (): number => {
    try {
      const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
      if (!expiry) return 0;

      const expiryTime = parseInt(expiry);
      const currentTime = Math.floor(Date.now() / 1000);

      return Math.max(0, expiryTime - currentTime);
    } catch (error) {
      console.error("Error getting token TTL:", error);
      return 0;
    }
  },

  // Decode JWT token (without verification)
  decodeToken: (token: string): any => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  },

  // Validate token structure
  isValidToken: (token: string): boolean => {
    try {
      const parts = token.split(".");
      if (parts.length !== 3) return false;

      const decoded = tokenStorage.decodeToken(token);
      if (!decoded) return false;

      // Check for required fields
      return !!(decoded.exp && decoded.iat && decoded.sub);
    } catch (error) {
      return false;
    }
  },

  // Get token payload
  getTokenPayload: (): any => {
    const token = tokenStorage.getToken();
    if (!token) return null;

    return tokenStorage.decodeToken(token);
  },

  // Get user ID from token
  getUserId: (): string | null => {
    const payload = tokenStorage.getTokenPayload();
    return payload?.sub || null;
  },

  // Check if token needs refresh (expires within 10 minutes)
  needsRefresh: (): boolean => {
    try {
      const ttl = tokenStorage.getTokenTTL();
      return ttl > 0 && ttl < 600; // 10 minutes
    } catch (error) {
      return true;
    }
  },
};

// User data management with type safety
export const userStorage = {
  // Get user data from storage
  getUser: (): User | null => {
    try {
      const userData = localStorage.getItem(USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("Error getting user from storage:", error);
      return null;
    }
  },

  // Set user data in storage
  setUser: (user: User): void => {
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error("Error setting user in storage:", error);
    }
  },

  // Remove user data from storage
  removeUser: (): void => {
    try {
      localStorage.removeItem(USER_KEY);
    } catch (error) {
      console.error("Error removing user from storage:", error);
    }
  },

  // Check if user data exists
  hasUser: (): boolean => {
    return userStorage.getUser() !== null;
  },

  // Update specific user fields
  updateUser: (updates: Partial<User>): void => {
    try {
      const currentUser = userStorage.getUser();
      if (currentUser) {
        const updatedUser = { ...currentUser, ...updates };
        userStorage.setUser(updatedUser);
      }
    } catch (error) {
      console.error("Error updating user in storage:", error);
    }
  },

  // Get user ID
  getUserId: (): string | null => {
    const user = userStorage.getUser();
    return user?.id || null;
  },

  // Get user email
  getUserEmail: (): string | null => {
    const user = userStorage.getUser();
    return user?.email || null;
  },

  // Get user name
  getUserName: (): string | null => {
    const user = userStorage.getUser();
    return user?.name || null;
  },
};

// Refresh token management with enhanced features
export const refreshTokenStorage = {
  // Get refresh token from storage
  getRefreshToken: (): string | null => {
    try {
      return localStorage.getItem(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error("Error getting refresh token from storage:", error);
      return null;
    }
  },

  // Set refresh token in storage
  setRefreshToken: (token: string): void => {
    try {
      localStorage.setItem(REFRESH_TOKEN_KEY, token);
    } catch (error) {
      console.error("Error setting refresh token in storage:", error);
    }
  },

  // Remove refresh token from storage
  removeRefreshToken: (): void => {
    try {
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error("Error removing refresh token from storage:", error);
    }
  },

  // Check if refresh token exists
  hasRefreshToken: (): boolean => {
    return refreshTokenStorage.getRefreshToken() !== null;
  },

  // Validate refresh token structure
  isValidRefreshToken: (token: string): boolean => {
    try {
      const parts = token.split(".");
      if (parts.length !== 3) return false;

      const decoded = tokenStorage.decodeToken(token);
      if (!decoded) return false;

      // Check for required fields
      return !!(decoded.exp && decoded.iat && decoded.sub);
    } catch (error) {
      return false;
    }
  },

  // Get refresh token payload
  getRefreshTokenPayload: (): any => {
    const token = refreshTokenStorage.getRefreshToken();
    if (!token) return null;

    return tokenStorage.decodeToken(token);
  },

  // Check if refresh token is expired
  isRefreshTokenExpired: (): boolean => {
    try {
      const token = refreshTokenStorage.getRefreshToken();
      if (!token) return true;

      const decoded = tokenStorage.decodeToken(token);
      if (!decoded || !decoded.exp) return true;

      const expiryTime = decoded.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();

      return currentTime >= expiryTime;
    } catch (error) {
      console.error("Error checking refresh token expiry:", error);
      return true;
    }
  },
};

// Authentication management utilities
export const clearAuthData = (): void => {
  tokenStorage.removeToken();
  userStorage.removeUser();
  refreshTokenStorage.removeRefreshToken();
};

// Check if user is authenticated with token validation
export const isAuthenticated = (): boolean => {
  const hasToken = tokenStorage.hasToken();
  const hasUser = userStorage.hasUser();
  const isExpired = tokenStorage.isTokenExpired();

  return hasToken && hasUser && !isExpired;
};

// Get authentication headers
export const getAuthHeaders = (): Record<string, string> => {
  const token = tokenStorage.getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Enhanced authentication utilities
export const authUtils = {
  // Store complete authentication data
  storeAuthData: (token: string, refreshToken: string, user: User): void => {
    tokenStorage.setToken(token);
    refreshTokenStorage.setRefreshToken(refreshToken);
    userStorage.setUser(user);
  },

  // Validate current authentication state
  validateAuthState: (): {
    isValid: boolean;
    hasToken: boolean;
    hasUser: boolean;
    isExpired: boolean;
    needsRefresh: boolean;
    hasRefreshToken: boolean;
    refreshTokenExpired: boolean;
  } => {
    const hasToken = tokenStorage.hasToken();
    const hasUser = userStorage.hasUser();
    const isExpired = tokenStorage.isTokenExpired();
    const needsRefresh = tokenStorage.needsRefresh();
    const hasRefreshToken = refreshTokenStorage.hasRefreshToken();
    const refreshTokenExpired = refreshTokenStorage.isRefreshTokenExpired();

    const isValid = hasToken && hasUser && !isExpired;

    return {
      isValid,
      hasToken,
      hasUser,
      isExpired,
      needsRefresh,
      hasRefreshToken,
      refreshTokenExpired,
    };
  },

  // Get authentication status for debugging
  getAuthStatus: (): {
    authenticated: boolean;
    tokenInfo: {
      exists: boolean;
      expired: boolean;
      ttl: number;
      userId: string | null;
      issued: Date | null;
      expires: Date | null;
    };
    userInfo: {
      exists: boolean;
      id: string | null;
      email: string | null;
      name: string | null;
    };
    refreshTokenInfo: {
      exists: boolean;
      expired: boolean;
    };
  } => {
    const token = tokenStorage.getToken();
    const user = userStorage.getUser();
    const refreshToken = refreshTokenStorage.getRefreshToken();

    return {
      authenticated: isAuthenticated(),
      tokenInfo: {
        exists: !!token,
        expired: tokenStorage.isTokenExpired(),
        ttl: tokenStorage.getTokenTTL(),
        userId: tokenStorage.getUserId(),
        issued: tokenStorage.getTokenIssued(),
        expires: tokenStorage.getTokenExpiry(),
      },
      userInfo: {
        exists: !!user,
        id: user?.id || null,
        email: user?.email || null,
        name: user?.name || null,
      },
      refreshTokenInfo: {
        exists: !!refreshToken,
        expired: refreshTokenStorage.isRefreshTokenExpired(),
      },
    };
  },

  // Auto-refresh token if needed
  autoRefreshToken: async (): Promise<boolean> => {
    try {
      const authState = authUtils.validateAuthState();

      if (
        !authState.needsRefresh ||
        !authState.hasRefreshToken ||
        authState.refreshTokenExpired
      ) {
        return false;
      }

      // This would typically call your refresh token API
      // For now, we'll just return false to indicate no refresh was attempted
      console.log("Token refresh needed but not implemented");
      return false;
    } catch (error) {
      console.error("Error in auto refresh:", error);
      return false;
    }
  },

  // Secure logout with cleanup
  secureLogout: (): void => {
    try {
      // Clear all auth data
      clearAuthData();

      // Clear any other session data
      sessionStorage.clear();

      // Clear any cached data
      if ("caches" in window) {
        caches.keys().then((names) => {
          names.forEach((name) => {
            caches.delete(name);
          });
        });
      }

      console.log("Secure logout completed");
    } catch (error) {
      console.error("Error during secure logout:", error);
    }
  },

  // Check if token is about to expire (within 1 hour)
  isTokenExpiringSoon: (): boolean => {
    try {
      const ttl = tokenStorage.getTokenTTL();
      return ttl > 0 && ttl < 3600; // 1 hour
    } catch (error) {
      return true;
    }
  },

  // Get token age in seconds
  getTokenAge: (): number => {
    try {
      const issued = tokenStorage.getTokenIssued();
      if (!issued) return 0;

      const currentTime = Math.floor(Date.now() / 1000);
      const issuedTime = Math.floor(issued.getTime() / 1000);

      return Math.max(0, currentTime - issuedTime);
    } catch (error) {
      console.error("Error getting token age:", error);
      return 0;
    }
  },
};
