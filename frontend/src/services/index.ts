// Export all services for easy importing

// Main API service
export { apiService, ApiService } from "./api";

// HTTP client
export { httpClient, HttpClient } from "./http-client";

// Storage utilities
export {
  tokenStorage,
  userStorage,
  refreshTokenStorage,
  clearAuthData,
  isAuthenticated,
  getAuthHeaders,
  authUtils,
} from "./storage";

// Token refresh service
export {
  tokenRefreshService,
  tokenRefreshUtils,
  TokenRefreshService,
  createTokenRefreshInterceptor,
  createBackgroundRefreshInterceptor,
  createNetworkAwareRefreshInterceptor,
} from "./token-refresh";
export type { TokenRefreshConfig, NetworkStatus } from "./token-refresh";

// Token refresh hooks
export {
  useTokenRefresh,
  useAutoTokenRefresh,
  useManualTokenRefresh,
  useBackgroundTokenRefresh,
  useNetworkAwareTokenRefresh,
  useTokenRefreshStatus,
  useTokenRefreshWithCallbacks,
} from "../hooks/useTokenRefresh";

// Logout service
export { logoutService, logoutUtils, LogoutService } from "./logout";
export type { LogoutOptions, LogoutResult, LogoutStrategy } from "./logout";

// Logout components and hooks
export {
  LogoutButton,
  LogoutConfirmDialog,
  useLogout,
  useAutoLogout,
} from "../components/LogoutButton";

// Interceptors
export {
  authRequestInterceptor,
  authResponseInterceptor,
  loggingRequestInterceptor,
  loggingResponseInterceptor,
  rateLimitResponseInterceptor,
  errorLoggingInterceptor,
  errorNotificationInterceptor,
  retryErrorInterceptor,
  createDefaultInterceptors,
  isTokenExpired,
  getTokenExpirationTime,
} from "./interceptors";

// Types
export * from "./types";

// Type utilities
export * from "./type-utils";

// Authentication context
export {
  AuthProvider,
  useAuth,
  useIsAuthenticated,
  useCurrentUser,
  useToken,
  useAuthStatus,
  useAuthActions,
  useAuthState,
  withAuth,
} from "../contexts/AuthContext";
export type {
  AuthContextType,
  AuthState,
  AuthActions,
} from "../contexts/AuthContext";

// Protected route components
export {
  ProtectedRoute,
  PublicRoute,
  RouteGuard,
  AuthStatus,
  ConditionalRender,
} from "../components/ProtectedRoute";
