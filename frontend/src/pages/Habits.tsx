import React, { useState, useEffect } from "react";
import CreateHabitModal from "../components/CreateHabitModal";
import HabitHeatmap from "../components/HabitHeatmap";
import Navbar from "../components/Navbar";
import { Plus, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { apiService } from "@/services/api";
import { Habit } from "@/services/types";
import { useAuth } from "@/contexts/AuthContext";

const Habits = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [optimisticUpdates, setOptimisticUpdates] = useState<Map<string, any>>(
    new Map()
  );
  const { user } = useAuth();

  // Fetch habits from API
  const fetchHabits = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiService.getHabits();

      if (response.success && response.data) {
        setHabits(response.data.habits);
      } else {
        setError(response.message || "Failed to fetch habits");
      }
    } catch (error: any) {
      console.error("Error fetching habits:", error);
      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch habits. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Load habits on component mount
  useEffect(() => {
    if (user) {
      fetchHabits();
    }
  }, [user]);

  // Create new habit with optimistic update
  const createHabit = async (name: string) => {
    try {
      setIsCreating(true);
      setError(null);

      // Create optimistic habit
      const optimisticHabit: Habit = {
        id: `temp-${Date.now()}`,
        name,
        description: "",
        category: "",
        frequency: "daily",
        targetDays: 1,
        completions: {},
        streak: 0,
        totalCompletions: 0,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Add optimistic update
      setOptimisticUpdates(
        (prev) => new Map(prev.set(optimisticHabit.id, optimisticHabit))
      );
      setHabits((prev) => [optimisticHabit, ...prev]);

      // Make API call
      const response = await apiService.createHabit({ name });

      if (response.success && response.data) {
        // Replace optimistic habit with real one
        setHabits((prev) =>
          prev.map((habit) =>
            habit.id === optimisticHabit.id ? response.data.habit : habit
          )
        );
        setIsModalOpen(false);
      } else {
        // Remove optimistic update on error
        setHabits((prev) =>
          prev.filter((habit) => habit.id !== optimisticHabit.id)
        );
        setError(response.message || "Failed to create habit");
      }
    } catch (error: any) {
      console.error("Error creating habit:", error);

      // Remove optimistic update on error
      setHabits((prev) =>
        prev.filter((habit) => !habit.id.startsWith("temp-"))
      );
      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to create habit. Please try again."
      );
    } finally {
      setIsCreating(false);
      setOptimisticUpdates((prev) => {
        const newMap = new Map(prev);
        newMap.clear();
        return newMap;
      });
    }
  };

  // Toggle completion with optimistic update
  const toggleCompletion = async (habitId: string, date: string) => {
    try {
      // Create optimistic update
      const optimisticHabit = habits.find((h) => h.id === habitId);
      if (!optimisticHabit) return;

      const newCompletions = {
        ...optimisticHabit.completions,
        [date]: !optimisticHabit.completions[date],
      };

      const updatedHabit = {
        ...optimisticHabit,
        completions: newCompletions,
        totalCompletions: Object.values(newCompletions).filter(Boolean).length,
        updatedAt: new Date().toISOString(),
      };

      // Apply optimistic update
      setOptimisticUpdates((prev) => new Map(prev.set(habitId, updatedHabit)));
      setHabits((prev) =>
        prev.map((habit) => (habit.id === habitId ? updatedHabit : habit))
      );

      // Make API call
      const response = await apiService.toggleHabitCompletion(habitId, {
        date,
      });

      if (response.success && response.data) {
        // Replace with real data
        setHabits((prev) =>
          prev.map((habit) =>
            habit.id === habitId ? response.data.habit : habit
          )
        );
      } else {
        // Revert optimistic update on error
        setHabits((prev) =>
          prev.map((habit) => (habit.id === habitId ? optimisticHabit : habit))
        );
        setError(response.message || "Failed to update habit");
      }
    } catch (error: any) {
      console.error("Error toggling completion:", error);

      // Revert optimistic update on error
      const originalHabit = habits.find((h) => h.id === habitId);
      if (originalHabit) {
        setHabits((prev) =>
          prev.map((habit) => (habit.id === habitId ? originalHabit : habit))
        );
      }
      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to update habit. Please try again."
      );
    } finally {
      setOptimisticUpdates((prev) => {
        const newMap = new Map(prev);
        newMap.delete(habitId);
        return newMap;
      });
    }
  };

  // Delete habit with optimistic update
  const deleteHabit = async (habitId: string) => {
    try {
      // Store original habit for rollback
      const originalHabit = habits.find((h) => h.id === habitId);
      if (!originalHabit) return;

      // Apply optimistic update
      setOptimisticUpdates((prev) => new Map(prev.set(habitId, null)));
      setHabits((prev) => prev.filter((habit) => habit.id !== habitId));

      // Make API call
      const response = await apiService.deleteHabit(habitId);

      if (!response.success) {
        // Revert optimistic update on error
        setHabits((prev) => [...prev, originalHabit]);
        setError(response.message || "Failed to delete habit");
      }
    } catch (error: any) {
      console.error("Error deleting habit:", error);

      // Revert optimistic update on error
      const originalHabit = habits.find((h) => h.id === habitId);
      if (originalHabit) {
        setHabits((prev) => [...prev, originalHabit]);
      }
      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to delete habit. Please try again."
      );
    } finally {
      setOptimisticUpdates((prev) => {
        const newMap = new Map(prev);
        newMap.delete(habitId);
        return newMap;
      });
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        <Navbar />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-purple-400 mb-4" />
            <p className="text-gray-400">Loading your habits...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && habits.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        <Navbar />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Failed to load habits
            </h3>
            <p className="text-gray-400 text-center mb-6 max-w-md">{error}</p>
            <button
              onClick={fetchHabits}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-violet-600 rounded-lg font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <Navbar />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error banner */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <span className="text-red-400">{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-300 transition-colors"
            >
              ×
            </button>
          </div>
        )}

        {habits.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <button
              onClick={() => setIsModalOpen(true)}
              disabled={isCreating}
              className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 via-violet-600 to-purple-700 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25 focus:outline-none focus:ring-4 focus:ring-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-violet-600 to-purple-700 rounded-xl blur opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center gap-2">
                {isCreating ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <Plus size={24} />
                )}
                {isCreating ? "Creating..." : "Create Your First Habit"}
              </div>
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex justify-center">
              <button
                onClick={() => setIsModalOpen(true)}
                disabled={isCreating}
                className="group relative px-6 py-3 bg-gradient-to-r from-purple-600 via-violet-600 to-purple-700 rounded-lg font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25 focus:outline-none focus:ring-4 focus:ring-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-violet-600 to-purple-700 rounded-lg blur opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center gap-2">
                  {isCreating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus size={20} />
                  )}
                  {isCreating ? "Creating..." : "Create Habit"}
                </div>
              </button>
            </div>

            <div className="space-y-12">
              {habits.map((habit) => (
                <HabitHeatmap
                  key={habit.id}
                  habit={habit}
                  onToggleCompletion={toggleCompletion}
                  onDelete={deleteHabit}
                  isOptimistic={optimisticUpdates.has(habit.id)}
                />
              ))}
            </div>
          </div>
        )}

        <CreateHabitModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={createHabit}
          isLoading={isCreating}
        />
      </div>
    </div>
  );
};

export default Habits;
