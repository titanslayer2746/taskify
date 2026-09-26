import React, { useState, useEffect } from "react";
import CreateHabitModal from "../components/CreateHabitModal";
import HabitHeatmap from "../components/HabitHeatmap";
import PaperPage, {
  PaperBanner,
  PaperEmpty,
  PaperErrorState,
  PaperLoading,
} from "../components/paper/PaperPage";
import { PaperButton } from "../components/paper/PaperDialog";
import { Plus } from "lucide-react";
import { todayDateline } from "@/lib/paper";
import { currentStreak, lastSevenDays, todayKey } from "@/lib/habits";
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

  const today = todayKey();
  const week = lastSevenDays();
  const keptToday = habits.filter((h) => h.completions[today]).length;
  const shell = (content: React.ReactNode) => (
    <PaperPage
      number="04"
      title="Habits"
      subtitle={todayDateline()}
      actions={
        habits.length > 0 ? (
          <PaperButton onClick={() => setIsModalOpen(true)} disabled={isCreating}>
            <Plus size={16} />
            New habit
          </PaperButton>
        ) : undefined
      }
    >
      {content}
      <CreateHabitModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={createHabit}
        isLoading={isCreating}
      />
    </PaperPage>
  );

  if (isLoading) return shell(<PaperLoading label="Opening your habits…" />);

  if (error && habits.length === 0) {
    return shell(<PaperErrorState message={error} onRetry={fetchHabits} />);
  }

  return shell(
    <>
      {error && <PaperBanner message={error} onDismiss={() => setError(null)} />}

      {habits.length === 0 ? (
        <PaperEmpty
          title="A blank page."
          body="Pick one small thing you'd like to do every day. Tick it off here, and over the year the squares fill in."
          action={
            <PaperButton onClick={() => setIsModalOpen(true)} disabled={isCreating}>
              <Plus size={16} />
              Add your first habit
            </PaperButton>
          }
        />
      ) : (
        <>
          {/* Today */}
          <section aria-labelledby="today-heading" className="mt-12">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2
                id="today-heading"
                className="font-ledger text-[11px] uppercase tracking-[0.18em] text-ink"
              >
                Today
              </h2>
              <p className="font-display text-xl italic text-ink-soft">
                {keptToday === habits.length
                  ? "All kept. Nicely done."
                  : `${keptToday} of ${habits.length} kept`}
              </p>
            </div>

            <ul className="mt-3 border-t border-ink/20">
              {habits.map((habit) => {
                const done = !!habit.completions[today];
                const pending =
                  optimisticUpdates.has(habit.id) || habit.id.startsWith("temp-");
                const streak = currentStreak(habit.completions);
                return (
                  <li key={habit.id} className="border-b border-paper-rule">
                    <button
                      onClick={() => toggleCompletion(habit.id, today)}
                      disabled={pending}
                      aria-pressed={done}
                      className="paper-focus group flex w-full items-center gap-4 py-4 text-left disabled:cursor-wait sm:gap-5"
                    >
                      <span
                        aria-hidden="true"
                        className={`grid h-6 w-6 shrink-0 place-items-center border-[1.5px] transition-colors duration-200 ${
                          done
                            ? "border-ink bg-ink"
                            : "border-ink/60 group-hover:border-ink group-hover:bg-ink/5"
                        }`}
                      >
                        {done && (
                          <svg viewBox="0 0 10 10" className="h-3.5 w-3.5 text-paper">
                            <path
                              d="M1.5 5.5l2.2 2.2L8.5 2.5"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.5"
                            />
                          </svg>
                        )}
                      </span>

                      <span
                        className={`min-w-0 flex-1 truncate text-lg transition-colors sm:text-xl ${
                          done
                            ? "text-ink-faint line-through decoration-clay decoration-[1.5px]"
                            : "text-ink"
                        }`}
                      >
                        {habit.name}
                      </span>

                      <span
                        aria-hidden="true"
                        className="hidden items-center gap-1 sm:flex"
                        title="Last 7 days"
                      >
                        {week.map((day) => (
                          <span
                            key={day}
                            className={`h-3 w-3 rounded-[2px] ${
                              habit.completions[day]
                                ? "bg-ink"
                                : day === today
                                ? "border border-clay"
                                : "border border-ink/25"
                            }`}
                          />
                        ))}
                      </span>

                      <span className="shrink-0 whitespace-nowrap text-right font-ledger text-xs text-ink-soft">
                        {pending ? "saving…" : streak > 0 ? `${streak}-day streak` : "—"}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>

          {/* The year */}
          <section aria-labelledby="year-heading" className="mt-24">
            <p className="mb-4 font-ledger text-[11px] uppercase tracking-[0.18em] text-ink-soft">
              {new Date().getFullYear()}
            </p>
            <h2
              id="year-heading"
              className="font-display text-5xl leading-[1.02] tracking-[-0.01em] sm:text-6xl"
            >
              The year, <span className="italic">one square a day.</span>
            </h2>

            <div className="mt-12 space-y-20">
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
          </section>
        </>
      )}
    </>
  );
};

export default Habits;
