import React, { useState, useEffect } from "react";
import CreateHabitModal from "../components/CreateHabitModal";
import HabitHeatmap from "../components/HabitHeatmap";
import { Plus } from "lucide-react";

interface Habit {
  id: string;
  name: string;
  completions: Record<string, boolean>;
}

const Index = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const savedHabits = localStorage.getItem("habits");
    if (savedHabits) {
      setHabits(JSON.parse(savedHabits));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("habits", JSON.stringify(habits));
  }, [habits]);

  const createHabit = (name: string) => {
    const newHabit: Habit = {
      id: Date.now().toString(),
      name,
      completions: {},
    };
    setHabits([...habits, newHabit]);
    setIsModalOpen(false);
  };

  const toggleCompletion = (habitId: string, date: string) => {
    setHabits(
      habits.map((habit) => {
        if (habit.id === habitId) {
          return {
            ...habit,
            completions: {
              ...habit.completions,
              [date]: !habit.completions[date],
            },
          };
        }
        return habit;
      })
    );
  };

  const deleteHabit = (habitId: string) => {
    setHabits(habits.filter((habit) => habit.id !== habitId));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-purple-400 via-violet-400 to-purple-600 bg-clip-text text-transparent mb-3 sm:mb-4 tracking-tight leading-tight py-2">
            Taskify
          </h1>
          <p className="text-gray-400 text-base sm:text-lg">
            Build consistency, track progress, achieve your goals
          </p>
        </div>

        {habits.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <button
              onClick={() => setIsModalOpen(true)}
              className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 via-violet-600 to-purple-700 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25 focus:outline-none focus:ring-4 focus:ring-purple-500/50"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-violet-600 to-purple-700 rounded-xl blur opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center gap-2">
                <Plus size={24} />
                Create Your First Habit
              </div>
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex justify-center">
              <button
                onClick={() => setIsModalOpen(true)}
                className="group relative px-6 py-3 bg-gradient-to-r from-purple-600 via-violet-600 to-purple-700 rounded-lg font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25 focus:outline-none focus:ring-4 focus:ring-purple-500/50"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-violet-600 to-purple-700 rounded-lg blur opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center gap-2">
                  <Plus size={20} />
                  Create Habit
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
                />
              ))}
            </div>
          </div>
        )}

        <CreateHabitModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={createHabit}
        />
      </div>
    </div>
  );
};

export default Index;
