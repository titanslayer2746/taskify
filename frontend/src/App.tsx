import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ChatbotProvider } from "@/contexts/ChatbotContext";
import { ProtectedRoute, PublicRoute } from "@/components/ProtectedRoute";
import { ChatbotBubble } from "@/components/chatbot/ChatbotBubble";
import { useAuth } from "@/hooks/useAuth";
import Index from "./pages/Index";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import VerifyOtp from "./pages/VerifyOtp";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Habits from "./pages/Habits";
import Todo from "./pages/Todo";
import Pomodoro from "./pages/Pomodoro";
import Finance from "./pages/Finance";
import Journal from "./pages/Journal";
import Health from "./pages/Health";
import Sleep from "./pages/Sleep";
import Projects from "./pages/Projects";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Component to conditionally render chatbot
const ChatbotWrapper = () => {
  const { user } = useAuth();
  const location = useLocation();
  const isPublicRoute = ["/", "/signin", "/signup", "/verify-otp", "/forgot-password", "/reset-password"].includes(location.pathname);

  // Only show chatbot on protected routes (when user is authenticated)
  if (!user || isPublicRoute) return null;

  return <ChatbotBubble />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ChatbotProvider>
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
              <Route
                path="/verify-otp"
                element={
                  <PublicRoute redirectTo="/habits">
                    <VerifyOtp />
                  </PublicRoute>
                }
              />
              <Route
                path="/forgot-password"
                element={
                  <PublicRoute redirectTo="/habits">
                    <ForgotPassword />
                  </PublicRoute>
                }
              />
              <Route
                path="/reset-password"
                element={
                  <PublicRoute redirectTo="/habits">
                    <ResetPassword />
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
              <Route
                path="/projects"
                element={
                  <ProtectedRoute>
                    <Projects />
                  </ProtectedRoute>
                }
              />
              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>

            {/* AI Chatbot - Only on protected routes */}
            <ChatbotWrapper />
          </BrowserRouter>
        </TooltipProvider>
      </ChatbotProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
