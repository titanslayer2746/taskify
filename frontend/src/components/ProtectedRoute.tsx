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
  <div className="paper-grain flex min-h-screen items-center justify-center font-paper text-ink" role="status">
    <p className="animate-pulse font-display text-3xl italic text-ink-soft">
      {message === "Loading..." ? "Opening your notebook…" : message}
    </p>
  </div>
);

// Default error component
const DefaultErrorComponent: React.FC<ErrorComponentProps> = ({
  error,
  onRetry,
}) => (
  <div className="paper-grain flex min-h-screen items-center justify-center px-4 font-paper text-ink" role="alert">
    <div className="max-w-md text-center">
      <p className="font-display text-4xl italic">We couldn't sign you in.</p>
      <p className="mt-3 text-ink-soft">{error}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="paper-focus mt-8 rounded-sm bg-ink px-5 py-2.5 text-[15px] font-medium text-paper transition-colors hover:bg-clay"
        >
          Try again
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
