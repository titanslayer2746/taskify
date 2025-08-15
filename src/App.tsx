import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
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
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/habits" element={<Habits />} />
          <Route path="/todo" element={<Todo />} />
          <Route path="/pomodoro" element={<Pomodoro />} />
          <Route path="/finance-tracker" element={<Finance />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/journal/:id" element={<Journal />} />
          <Route path="/health" element={<Health />} />
          <Route path="/health/workout/:id" element={<Health />} />
          <Route path="/health/diet/:id" element={<Health />} />
          <Route path="/sleep" element={<Sleep />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
