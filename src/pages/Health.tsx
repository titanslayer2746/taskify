import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import WorkoutPlanModal from "../components/WorkoutPlanModal";
import DietPlanModal from "../components/DietPlanModal";
import ConfirmationDialog from "../components/ConfirmationDialog";
import {
  Dumbbell,
  Utensils,
  Plus,
  BookOpen,
  ArrowLeft,
  Edit,
  Trash2,
} from "lucide-react";
import { motion } from "framer-motion";

interface WorkoutPlan {
  id: string;
  name: string;
  description: string;
  exercises: Exercise[];
  weeklySchedule: WeeklySchedule;
  duration: number; // in weeks
  createdAt: string;
}

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  duration?: number; // in minutes
  notes?: string;
}

interface WeeklySchedule {
  sunday: string[];
  monday: string[];
  tuesday: string[];
  wednesday: string[];
  thursday: string[];
  friday: string[];
  saturday: string[];
}

interface DietPlan {
  id: string;
  name: string;
  description: string;
  meals: Meal[];
  duration: number; // in weeks
  createdAt: string;
}

interface Meal {
  id: string;
  name: string;
  type: "breakfast" | "lunch" | "dinner" | "snack";
  foods: Food[];
  calories: number;
  notes?: string;
}

interface Food {
  id: string;
  name: string;
  quantity: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

const Health = () => {
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [dietPlans, setDietPlans] = useState<DietPlan[]>([]);
  const [activeTab, setActiveTab] = useState<"workout" | "diet">("workout");
  const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState(false);
  const [isDietModalOpen, setIsDietModalOpen] = useState(false);
  const [editingWorkoutPlan, setEditingWorkoutPlan] =
    useState<WorkoutPlan | null>(null);
  const [editingDietPlan, setEditingDietPlan] = useState<DietPlan | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    planId: string | null;
    planName: string;
  }>({
    isOpen: false,
    planId: null,
    planName: "",
  });

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    const savedWorkoutPlans = localStorage.getItem("workoutPlans");
    const savedDietPlans = localStorage.getItem("dietPlans");

    if (savedWorkoutPlans) {
      setWorkoutPlans(JSON.parse(savedWorkoutPlans));
    }
    if (savedDietPlans) {
      setDietPlans(JSON.parse(savedDietPlans));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("workoutPlans", JSON.stringify(workoutPlans));
  }, [workoutPlans]);

  useEffect(() => {
    localStorage.setItem("dietPlans", JSON.stringify(dietPlans));
  }, [dietPlans]);

  const createWorkoutNote = () => {
    const today = new Date().toISOString().split("T")[0];
    const title = `Workout - ${today}`;

    // Create a new journal entry with workout tag
    const newEntry = {
      id: Date.now().toString(),
      title,
      content: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: ["workout"],
    };

    // Get existing journal entries
    const existingEntries = localStorage.getItem("journalEntries");
    const entries = existingEntries ? JSON.parse(existingEntries) : [];

    // Add new entry
    entries.unshift(newEntry);
    localStorage.setItem("journalEntries", JSON.stringify(entries));

    // Navigate to the new journal entry
    window.open(`/journal/${newEntry.id}`, "_blank");
  };

  const createDietNote = () => {
    const today = new Date().toISOString().split("T")[0];
    const title = `Diet - ${today}`;

    // Create a new journal entry with diet tag
    const newEntry = {
      id: Date.now().toString(),
      title,
      content: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: ["diet"],
    };

    // Get existing journal entries
    const existingEntries = localStorage.getItem("journalEntries");
    const entries = existingEntries ? JSON.parse(existingEntries) : [];

    // Add new entry
    entries.unshift(newEntry);
    localStorage.setItem("journalEntries", JSON.stringify(entries));

    // Navigate to the new journal entry
    window.open(`/journal/${newEntry.id}`, "_blank");
  };

  const handleSaveWorkoutPlan = (plan: WorkoutPlan) => {
    if (editingWorkoutPlan) {
      setWorkoutPlans(workoutPlans.map((p) => (p.id === plan.id ? plan : p)));
      setEditingWorkoutPlan(null);
    } else {
      setWorkoutPlans([plan, ...workoutPlans]);
    }
  };

  const handleSaveDietPlan = (plan: DietPlan) => {
    if (editingDietPlan) {
      setDietPlans(dietPlans.map((p) => (p.id === plan.id ? plan : p)));
      setEditingDietPlan(null);
    } else {
      setDietPlans([plan, ...dietPlans]);
    }
  };

  const handleDeleteWorkoutPlan = (planId: string) => {
    setWorkoutPlans(workoutPlans.filter((p) => p.id !== planId));
  };

  const handleDeleteClick = (planId: string, planName: string) => {
    setDeleteConfirmation({
      isOpen: true,
      planId,
      planName,
    });
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmation.planId) {
      handleDeleteWorkoutPlan(deleteConfirmation.planId);
      setDeleteConfirmation({
        isOpen: false,
        planId: null,
        planName: "",
      });
    }
  };

  const handleDeleteDietPlan = (planId: string) => {
    if (confirm("Are you sure you want to delete this diet plan?")) {
      setDietPlans(dietPlans.filter((p) => p.id !== planId));
    }
  };

  const handleEditWorkoutPlan = (plan: WorkoutPlan) => {
    const planWithSchedule = {
      ...plan,
      weeklySchedule: plan.weeklySchedule || {
        sunday: [],
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
        saturday: [],
      },
    };
    setEditingWorkoutPlan(planWithSchedule);
    setIsWorkoutModalOpen(true);
  };

  const handleEditDietPlan = (plan: DietPlan) => {
    setEditingDietPlan(plan);
    setIsDietModalOpen(true);
  };

  // Check if we're viewing a specific plan
  const currentWorkoutPlan = id ? workoutPlans.find((p) => p.id === id) : null;
  const currentDietPlan = id ? dietPlans.find((p) => p.id === id) : null;

  // Scroll to today's workout plan when viewing a specific plan
  useEffect(() => {
    if (currentWorkoutPlan) {
      const today = new Date()
        .toLocaleDateString("en-US", { weekday: "long" })
        .toLowerCase();
      const todayElement = document.getElementById(`workout-day-${today}`);
      if (todayElement) {
        setTimeout(() => {
          todayElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }, 500); // Small delay to ensure DOM is ready
      }
    }
  }, [currentWorkoutPlan]);

  if (currentWorkoutPlan) {
    // Ensure backward compatibility for existing plans without weeklySchedule
    const planWithSchedule = {
      ...currentWorkoutPlan,
      weeklySchedule: currentWorkoutPlan.weeklySchedule || {
        sunday: [],
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
        saturday: [],
      },
    };

    // Get today's day name for scrolling
    const today = new Date()
      .toLocaleDateString("en-US", { weekday: "long" })
      .toLowerCase();
    const todayIndex = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ].indexOf(today);

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        <Navbar />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => navigate("/health")}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all duration-200"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-3xl font-bold text-white">
              {planWithSchedule.name}
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-gray-800/30 rounded-xl border border-gray-700/30 p-6">
                <h2 className="text-2xl font-bold mb-4">Weekly Schedule</h2>
                <div className="space-y-4">
                  {(
                    [
                      "sunday",
                      "monday",
                      "tuesday",
                      "wednesday",
                      "thursday",
                      "friday",
                      "saturday",
                    ] as const
                  ).map((day) => {
                    const dayExercises = planWithSchedule.weeklySchedule[day]
                      .map((exerciseId) =>
                        planWithSchedule.exercises.find(
                          (ex) => ex.id === exerciseId
                        )
                      )
                      .filter(Boolean);

                    // Get today's day name
                    const today = new Date()
                      .toLocaleDateString("en-US", { weekday: "long" })
                      .toLowerCase();
                    const isToday = day === today;

                    return (
                      <div
                        key={day}
                        id={`workout-day-${day}`}
                        className={`rounded-lg p-4 border transition-all duration-300 ${
                          isToday
                            ? "bg-gradient-to-br from-pink-500/20 to-red-500/20 border-pink-500/40 shadow-lg shadow-pink-500/10"
                            : "bg-gray-700/30 border-gray-600/30"
                        }`}
                      >
                        <div className="flex justify-between items-center mb-3">
                          <div className="flex items-center gap-2">
                            <h3
                              className={`text-lg font-semibold capitalize ${
                                isToday ? "text-pink-400" : "text-white"
                              }`}
                            >
                              {day}
                            </h3>
                            {isToday && (
                              <span className="px-2 py-1 text-xs bg-pink-500/20 text-pink-300 rounded-full border border-pink-500/30">
                                Today
                              </span>
                            )}
                          </div>
                          <span
                            className={`${
                              isToday ? "text-pink-300" : "text-gray-400"
                            }`}
                          >
                            {dayExercises.length}{" "}
                            {dayExercises.length === 1
                              ? "exercise"
                              : "exercises"}
                          </span>
                        </div>
                        {dayExercises.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {dayExercises.map((exercise) => (
                              <div
                                key={exercise!.id}
                                className="bg-gray-600/30 rounded-lg p-3 border border-gray-500/30"
                              >
                                <div className="font-medium text-white mb-1">
                                  {exercise!.name}
                                </div>
                                <div className="text-sm text-gray-400">
                                  {exercise!.sets} sets × {exercise!.reps} reps
                                </div>
                                {exercise!.notes && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    {exercise!.notes}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-gray-400 text-center py-4">
                            No exercises scheduled for this day
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-800/30 rounded-xl border border-gray-700/30 p-6">
                <h3 className="text-xl font-bold mb-4">Plan Details</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-gray-400">Duration:</span>
                    <p className="font-medium">
                      {currentWorkoutPlan.duration} weeks
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-400">Exercises:</span>
                    <p className="font-medium">
                      {currentWorkoutPlan.exercises.length}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-400">Created:</span>
                    <p className="font-medium">
                      {new Date(
                        currentWorkoutPlan.createdAt
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentDietPlan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        <Navbar />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => navigate("/health")}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all duration-200"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-3xl font-bold text-white">
              {currentDietPlan.name}
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-gray-800/30 rounded-xl border border-gray-700/30 p-6">
                <h2 className="text-2xl font-bold mb-4">Meals</h2>
                <div className="space-y-6">
                  {currentDietPlan.meals.map((meal, index) => (
                    <div
                      key={meal.id}
                      className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/30"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold">{meal.name}</h3>
                          <span className="text-sm text-gray-400 capitalize">
                            {meal.type}
                          </span>
                        </div>
                        <span className="text-gray-400">#{index + 1}</span>
                      </div>

                      <div className="space-y-2">
                        {meal.foods.map((food) => (
                          <div
                            key={food.id}
                            className="flex justify-between items-center py-2 border-b border-gray-600/30 last:border-b-0"
                          >
                            <div>
                              <span className="font-medium">{food.name}</span>
                              <span className="text-gray-400 ml-2">
                                ({food.quantity})
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="font-medium">
                                {food.calories} cal
                              </span>
                              {food.protein && (
                                <span className="text-gray-400 ml-2">
                                  {food.protein}g protein
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {meal.notes && (
                        <div className="mt-4 pt-4 border-t border-gray-600/30">
                          <span className="text-gray-400">Notes:</span>
                          <p className="text-sm mt-1">{meal.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-800/30 rounded-xl border border-gray-700/30 p-6">
                <h3 className="text-xl font-bold mb-4">Plan Details</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-gray-400">Duration:</span>
                    <p className="font-medium">
                      {currentDietPlan.duration} weeks
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-400">Meals:</span>
                    <p className="font-medium">
                      {currentDietPlan.meals.length}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-400">Created:</span>
                    <p className="font-medium">
                      {new Date(currentDietPlan.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEditDietPlan(currentDietPlan)}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-green-500/25"
                >
                  <Edit size={16} className="inline mr-2" />
                  Edit Plan
                </button>
                <button
                  onClick={() => handleDeleteDietPlan(currentDietPlan.id)}
                  className="px-4 py-2 bg-red-600/20 border border-red-500/30 rounded-lg font-medium transition-all duration-300 hover:bg-red-600/30 hover:border-red-500/50"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <Navbar />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="flex bg-gray-800/50 rounded-lg p-1 border border-gray-700/30">
            <button
              onClick={() => setActiveTab("workout")}
              className={`px-6 py-3 rounded-md font-medium transition-all duration-200 flex items-center gap-2 ${
                activeTab === "workout"
                  ? "bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-lg"
                  : "text-gray-400 hover:text-white hover:bg-gray-700/50"
              }`}
            >
              <Dumbbell size={18} />
              Workout Plans
            </button>
            <button
              onClick={() => setActiveTab("diet")}
              className={`px-6 py-3 rounded-md font-medium transition-all duration-200 flex items-center gap-2 ${
                activeTab === "diet"
                  ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg"
                  : "text-gray-400 hover:text-white hover:bg-gray-700/50"
              }`}
            >
              <Utensils size={18} />
              Diet Plans
            </button>
          </div>
        </div>

        {/* Content */}
        {activeTab === "workout" ? (
          <div className="space-y-8">
            {/* Workout Plans Header */}
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Workout Plans</h2>
              <div className="flex gap-2">
                <button
                  onClick={createWorkoutNote}
                  className="group relative px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25 focus:outline-none focus:ring-4 focus:ring-blue-500/50"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center gap-2">
                    <BookOpen size={16} />
                    Today's Notes
                  </div>
                </button>
                <button
                  onClick={() => setIsWorkoutModalOpen(true)}
                  className="group relative px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 rounded-lg font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-red-500/25 focus:outline-none focus:ring-4 focus:ring-red-500/50"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-pink-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center gap-2">
                    <Plus size={16} />
                    Create Plan
                  </div>
                </button>
              </div>
            </div>

            {/* Workout Plans Grid */}
            {workoutPlans.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-24 h-24 bg-gradient-to-r from-red-500/20 to-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Dumbbell className="w-12 h-12 text-red-400" />
                </div>
                <h3 className="text-2xl font-bold mb-4">
                  No Workout Plans Yet
                </h3>
                <p className="text-gray-400 mb-8 max-w-md mx-auto text-center">
                  Create your first workout plan to start your fitness journey.
                  Plan your exercises, sets, and reps for the next month.
                </p>
                <button
                  onClick={() => setIsWorkoutModalOpen(true)}
                  className="group relative px-8 py-4 bg-gradient-to-r from-red-600 to-pink-600 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-red-500/25 focus:outline-none focus:ring-4 focus:ring-red-500/50"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-pink-600 rounded-xl blur opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center gap-2">
                    <Plus size={24} />
                    Create Your First Workout Plan
                  </div>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {workoutPlans.map((plan) => {
                  // Ensure backward compatibility for existing plans without weeklySchedule
                  const planWithSchedule = {
                    ...plan,
                    weeklySchedule: plan.weeklySchedule || {
                      sunday: [],
                      monday: [],
                      tuesday: [],
                      wednesday: [],
                      thursday: [],
                      friday: [],
                      saturday: [],
                    },
                  };

                  // Calculate total scheduled exercises
                  const totalScheduled = Object.values(
                    planWithSchedule.weeklySchedule
                  ).reduce((sum, dayExercises) => sum + dayExercises.length, 0);
                  const daysWithExercises = Object.values(
                    planWithSchedule.weeklySchedule
                  ).filter((dayExercises) => dayExercises.length > 0).length;

                  return (
                    <motion.div
                      key={plan.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gray-800/30 rounded-xl border border-gray-700/30 overflow-hidden hover:border-gray-600/50 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/25"
                    >
                      <div className="p-6">
                        <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                        <p className="text-gray-400 mb-4">{plan.description}</p>

                        {/* Weekly Schedule Preview */}
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-300 mb-2">
                            Weekly Schedule
                          </h4>
                          <div className="grid grid-cols-7 gap-1">
                            {(
                              [
                                "sun",
                                "mon",
                                "tue",
                                "wed",
                                "thu",
                                "fri",
                                "sat",
                              ] as const
                            ).map((day) => {
                              const dayKey =
                                day === "sun"
                                  ? "sunday"
                                  : day === "mon"
                                  ? "monday"
                                  : day === "tue"
                                  ? "tuesday"
                                  : day === "wed"
                                  ? "wednesday"
                                  : day === "thu"
                                  ? "thursday"
                                  : day === "fri"
                                  ? "friday"
                                  : "saturday";
                              const exerciseCount =
                                planWithSchedule.weeklySchedule[dayKey].length;

                              return (
                                <div
                                  key={day}
                                  className={`text-center py-1 rounded text-xs font-medium ${
                                    exerciseCount > 0
                                      ? "bg-gradient-to-r from-red-600/20 to-pink-600/20 text-red-400 border border-red-500/30"
                                      : "bg-gray-700/30 text-gray-500"
                                  }`}
                                >
                                  <div className="text-xs">
                                    {day.toUpperCase()}
                                  </div>
                                  <div className="text-xs">{exerciseCount}</div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div className="flex justify-between items-center text-sm text-gray-400">
                          <span>{plan.exercises.length} exercises</span>
                          <span>{daysWithExercises} active days</span>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Link
                            to={`/health/workout/${plan.id}`}
                            className="flex-1 px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 rounded-lg text-center font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-red-500/25"
                          >
                            View Plan
                          </Link>
                          <button
                            onClick={() => handleEditWorkoutPlan(plan)}
                            className="px-4 py-2 bg-gray-600/50 border border-gray-500/50 rounded-lg font-medium transition-all duration-300 hover:bg-gray-600/70 hover:border-gray-500/70"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteClick(plan.id, plan.name)
                            }
                            className="px-4 py-2 bg-red-600/20 border border-red-500/30 rounded-lg font-medium transition-all duration-300 hover:bg-red-600/30 hover:border-red-500/50"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {/* Diet Plans Header */}
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Diet Plans</h2>
              <div className="flex gap-2">
                <button
                  onClick={createDietNote}
                  className="group relative px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25 focus:outline-none focus:ring-4 focus:ring-blue-500/50"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center gap-2">
                    <BookOpen size={16} />
                    Today's Notes
                  </div>
                </button>
                <button
                  onClick={() => setIsDietModalOpen(true)}
                  className="group relative px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-green-500/25 focus:outline-none focus:ring-4 focus:ring-green-500/50"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center gap-2">
                    <Plus size={16} />
                    Create Plan
                  </div>
                </button>
              </div>
            </div>

            {/* Diet Plans Grid */}
            {dietPlans.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-24 h-24 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Utensils className="w-12 h-12 text-green-400" />
                </div>
                <h3 className="text-2xl font-bold mb-4">No Diet Plans Yet</h3>
                <p className="text-gray-400 mb-8 max-w-md mx-auto text-center">
                  Create your first diet plan to start your nutrition journey.
                  Plan your meals, calories, and macros for the next month.
                </p>
                <button
                  onClick={() => setIsDietModalOpen(true)}
                  className="group relative px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-green-500/25 focus:outline-none focus:ring-4 focus:ring-green-500/50"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl blur opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center gap-2">
                    <Plus size={24} />
                    Create Your First Diet Plan
                  </div>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dietPlans.map((plan) => (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-800/30 rounded-xl border border-gray-700/30 overflow-hidden hover:border-gray-600/50 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/25"
                  >
                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                      <p className="text-gray-400 mb-4">{plan.description}</p>
                      <div className="flex justify-between items-center text-sm text-gray-400">
                        <span>{plan.meals.length} meals</span>
                        <span>{plan.duration} weeks</span>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Link
                          to={`/health/diet/${plan.id}`}
                          className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg text-center font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-green-500/25"
                        >
                          View Plan
                        </Link>
                        <button
                          onClick={() => handleEditDietPlan(plan)}
                          className="px-4 py-2 bg-gray-600/50 border border-gray-500/50 rounded-lg font-medium transition-all duration-300 hover:bg-gray-600/70 hover:border-gray-500/70"
                        >
                          <Edit size={16} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <WorkoutPlanModal
        isOpen={isWorkoutModalOpen}
        onClose={() => {
          setIsWorkoutModalOpen(false);
          setEditingWorkoutPlan(null);
        }}
        onSave={handleSaveWorkoutPlan}
        plan={editingWorkoutPlan}
      />

      <DietPlanModal
        isOpen={isDietModalOpen}
        onClose={() => {
          setIsDietModalOpen(false);
          setEditingDietPlan(null);
        }}
        onSave={handleSaveDietPlan}
        plan={editingDietPlan}
      />

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={deleteConfirmation.isOpen}
        onClose={() =>
          setDeleteConfirmation({
            isOpen: false,
            planId: null,
            planName: "",
          })
        }
        onConfirm={handleConfirmDelete}
        title="Delete Workout Plan"
        message={`Are you sure you want to delete "${deleteConfirmation.planName}"? This action cannot be undone.`}
        confirmText="Delete Plan"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default Health;
