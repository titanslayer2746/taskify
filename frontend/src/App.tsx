import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute, PublicRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Habits from "./pages/Habits";
import Todo from "./pages/Todo";
import Pomodoro from "./pages/Pomodoro";
import Finance from "./pages/Finance";
import Journal from "./pages/Journal";
import Health from "./pages/Health";
import Sleep from "./pages/Sleep";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
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

            {/* Protected Feature Routes */}
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
              path="/pomodoro"
              element={
                <ProtectedRoute>
                  <Pomodoro />
                </ProtectedRoute>
              }
            />
            <Route
              path="/finance-tracker"
              element={
                <ProtectedRoute>
                  <Finance />
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
              path="/journal/:id"
              element={
                <ProtectedRoute>
                  <Journal />
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
              path="/health/workout/:id"
              element={
                <ProtectedRoute>
                  <Health />
                </ProtectedRoute>
              }
            />
            <Route
              path="/health/diet/:id"
              element={
                <ProtectedRoute>
                  <Health />
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
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
