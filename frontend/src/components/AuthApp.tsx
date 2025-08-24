// Example App Component with Authentication Context Integration

import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import { ProtectedRoute, PublicRoute } from "./ProtectedRoute";

// Import your existing pages
import Index from "../pages/Index";
import SignIn from "../pages/SignIn";
import SignUp from "../pages/SignUp";
import Habits from "../pages/Habits";
import Todo from "../pages/Todo";
import Journal from "../pages/Journal";
import Finance from "../pages/Finance";
import Sleep from "../pages/Sleep";
import Health from "../pages/Health";
import Pomodoro from "../pages/Pomodoro";
import NotFound from "../pages/NotFound";

// Import your existing components
import Navbar from "./Navbar";
import LandingNavbar from "./LandingNavbar";

// Main app content component
const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading, isInitialized } = useAuth();

  // Show loading while initializing
  if (!isInitialized || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-300 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-900">
        {/* Conditional navbar rendering */}
        {isAuthenticated ? <Navbar /> : <LandingNavbar />}

        <main className="container mx-auto px-4 py-8">
          <Routes>
            {/* Public routes */}
            <Route
              path="/"
              element={
                <PublicRoute redirectTo="/habits">
                  <Index />
                </PublicRoute>
              }
            />

            <Route
              path="/signin"
              element={
                <PublicRoute redirectTo="/habits">
                  <SignIn />
                </PublicRoute>
              }
            />

            <Route
              path="/signup"
              element={
                <PublicRoute redirectTo="/habits">
                  <SignUp />
                </PublicRoute>
              }
            />

            {/* Protected routes */}
            <Route
              path="/habits"
              element={
                <ProtectedRoute>
                  <Habits />
                </ProtectedRoute>
              }
            />

            <Route
              path="/todo"
              element={
                <ProtectedRoute>
                  <Todo />
                </ProtectedRoute>
              }
            />

            <Route
              path="/journal"
              element={
                <ProtectedRoute>
                  <Journal />
                </ProtectedRoute>
              }
            />

            <Route
              path="/finance"
              element={
                <ProtectedRoute>
                  <Finance />
                </ProtectedRoute>
              }
            />

            <Route
              path="/sleep"
              element={
                <ProtectedRoute>
                  <Sleep />
                </ProtectedRoute>
              }
            />

            <Route
              path="/health"
              element={
                <ProtectedRoute>
                  <Health />
                </ProtectedRoute>
              }
            />

            <Route
              path="/pomodoro"
              element={
                <ProtectedRoute>
                  <Pomodoro />
                </ProtectedRoute>
              }
            />

            {/* Catch all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

// Main app component with auth provider
const AuthApp: React.FC = () => {
  // Auth state change handler
  const handleAuthStateChange = (isAuthenticated: boolean, user: any) => {
    console.log("Auth state changed:", { isAuthenticated, user });

    // You can add additional logic here, such as:
    // - Analytics tracking
    // - User preferences loading
    // - Notification setup
    // - Theme preferences
  };

  return (
    <AuthProvider
      onAuthStateChange={handleAuthStateChange}
      autoRefresh={true}
      refreshThreshold={300} // 5 minutes
    >
      <AppContent />
    </AuthProvider>
  );
};

export default AuthApp;
