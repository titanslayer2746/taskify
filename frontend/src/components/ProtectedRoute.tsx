// Protected Route Component for Authentication

import React, { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

// Loading component interface
interface LoadingComponentProps {
  message?: string;
}

// Error component interface
interface ErrorComponentProps {
  error: string;
  onRetry?: () => void;
}

// Protected route props interface
interface ProtectedRouteProps {
  children: ReactNode;
  redirectTo?: string;
  requireAuth?: boolean;
  fallback?: React.ComponentType;
  loadingComponent?: React.ComponentType<LoadingComponentProps>;
  errorComponent?: React.ComponentType<ErrorComponentProps>;
  onUnauthorized?: () => void;
}

// Default loading component
const DefaultLoadingComponent: React.FC<LoadingComponentProps> = ({
  message = "Loading...",
}) => (
  <div className="flex items-center justify-center min-h-screen bg-gray-900">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
      <p className="text-gray-300 text-lg">{message}</p>
    </div>
  </div>
);

// Default error component
const DefaultErrorComponent: React.FC<ErrorComponentProps> = ({
  error,
  onRetry,
}) => (
  <div className="flex items-center justify-center min-h-screen bg-gray-900">
    <div className="text-center">
      <div className="text-red-500 text-6xl mb-4">⚠️</div>
      <h2 className="text-red-400 text-xl font-semibold mb-2">
        Authentication Error
      </h2>
      <p className="text-gray-300 mb-4">{error}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  </div>
);

// Protected route component
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  redirectTo = "/signin",
  requireAuth = true,
  fallback,
  loadingComponent: LoadingComponent = DefaultLoadingComponent,
  errorComponent: ErrorComponent = DefaultErrorComponent,
  onUnauthorized,
}) => {
  const { isAuthenticated, isLoading, error, isInitialized } = useAuth();
  const location = useLocation();

  // Handle loading state
  if (!isInitialized || isLoading) {
    return <LoadingComponent message="Initializing authentication..." />;
  }

  // Handle error state
  if (error) {
    return (
      <ErrorComponent
        error={error}
        onRetry={() => {
          // You can implement retry logic here
          window.location.reload();
        }}
      />
    );
  }

  // Handle authentication requirement
  if (requireAuth && !isAuthenticated) {
    // Call unauthorized callback if provided
    onUnauthorized?.();

    // Redirect to login page with return URL
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Handle fallback for non-authenticated users
  if (!requireAuth && !isAuthenticated && fallback) {
    return <fallback />;
  }

  // Render children if all conditions are met
  return <>{children}</>;
};

// Public route component (opposite of protected route)
interface PublicRouteProps {
  children: ReactNode;
  redirectTo?: string;
  fallback?: React.ComponentType;
  loadingComponent?: React.ComponentType<LoadingComponentProps>;
}

export const PublicRoute: React.FC<PublicRouteProps> = ({
  children,
  redirectTo = "/",
  fallback,
  loadingComponent: LoadingComponent = DefaultLoadingComponent,
}) => {
  const { isAuthenticated, isLoading, isInitialized } = useAuth();

  // Handle loading state
  if (!isInitialized || isLoading) {
    return <LoadingComponent message="Loading..." />;
  }

  // Redirect authenticated users away from public routes
  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // Render children for non-authenticated users
  return <>{children}</>;
};

// Route guard component for conditional rendering
interface RouteGuardProps {
  children: ReactNode;
  condition: boolean;
  fallback?: ReactNode;
  loadingComponent?: React.ComponentType<LoadingComponentProps>;
}

export const RouteGuard: React.FC<RouteGuardProps> = ({
  children,
  condition,
  fallback,
  loadingComponent: LoadingComponent = DefaultLoadingComponent,
}) => {
  const { isLoading, isInitialized } = useAuth();

  // Handle loading state
  if (!isInitialized || isLoading) {
    return <LoadingComponent message="Loading..." />;
  }

  // Render based on condition
  if (condition) {
    return <>{children}</>;
  }

  return <>{fallback || null}</>;
};

// Authentication status component
interface AuthStatusProps {
  children: (status: {
    isAuthenticated: boolean;
    isLoading: boolean;
    isInitialized: boolean;
    error: string | null;
  }) => ReactNode;
}

export const AuthStatus: React.FC<AuthStatusProps> = ({ children }) => {
  const { isAuthenticated, isLoading, isInitialized, error } = useAuth();

  return (
    <>
      {children({
        isAuthenticated,
        isLoading,
        isInitialized,
        error,
      })}
    </>
  );
};

// Conditional render component
interface ConditionalRenderProps {
  when: boolean;
  children: ReactNode;
  fallback?: ReactNode;
}

export const ConditionalRender: React.FC<ConditionalRenderProps> = ({
  when,
  children,
  fallback,
}) => {
  return <>{when ? children : fallback || null}</>;
};

// Export default components
export default ProtectedRoute;
