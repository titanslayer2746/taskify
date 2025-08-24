import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Plus,
  Trash2,
  Dumbbell,
  ArrowLeft,
  ArrowRight,
  Calendar,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  duration?: number;
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

interface WorkoutPlan {
  id: string;
  name: string;
  description: string;
  exercises: Exercise[];
  weeklySchedule: WeeklySchedule;
  duration: number;
  createdAt: string;
}

interface WorkoutPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (plan: WorkoutPlan) => void;
  plan?: WorkoutPlan | null;
}

const WorkoutPlanModal: React.FC<WorkoutPlanModalProps> = ({
  isOpen,
  onClose,
  onSave,
  plan,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState(4);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [weeklySchedule, setWeeklySchedule] = useState<WeeklySchedule>({
    sunday: [],
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
  });

  const exerciseRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    if (plan) {
      setName(plan.name);
      setDescription(plan.description);
      setDuration(plan.duration);
      setExercises(plan.exercises);
      setWeeklySchedule(
        plan.weeklySchedule || {
          sunday: [],
          monday: [],
          tuesday: [],
          wednesday: [],
          thursday: [],
          friday: [],
          saturday: [],
        }
      );
      setCurrentStep(1);
    } else {
      setName("");
      setDescription("");
      setDuration(4);
      setExercises([]);
      setWeeklySchedule({
        sunday: [],
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
        saturday: [],
      });
      setCurrentStep(1);
    }
  }, [plan, isOpen]);

  const addExercise = () => {
    const newExercise: Exercise = {
      id: Date.now().toString(),
      name: "",
      sets: 3,
      reps: 10,
      duration: 0,
      notes: "",
    };
    setExercises([...exercises, newExercise]);

    // Scroll to the new exercise after it's added
    setTimeout(() => {
      const newExerciseElement = exerciseRefs.current[newExercise.id];
      if (newExerciseElement) {
        newExerciseElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }, 100);
  };

  const updateExercise = (id: string, updates: Partial<Exercise>) => {
    setExercises(
      exercises.map((exercise) =>
        exercise.id === id ? { ...exercise, ...updates } : exercise
      )
    );
  };

  const removeExercise = (id: string) => {
    setExercises(exercises.filter((exercise) => exercise.id !== id));
    // Also remove this exercise from the weekly schedule
    setWeeklySchedule((prev) => ({
      sunday: prev.sunday.filter((exerciseId) => exerciseId !== id),
      monday: prev.monday.filter((exerciseId) => exerciseId !== id),
      tuesday: prev.tuesday.filter((exerciseId) => exerciseId !== id),
      wednesday: prev.wednesday.filter((exerciseId) => exerciseId !== id),
      thursday: prev.thursday.filter((exerciseId) => exerciseId !== id),
      friday: prev.friday.filter((exerciseId) => exerciseId !== id),
      saturday: prev.saturday.filter((exerciseId) => exerciseId !== id),
    }));
  };

  const toggleExerciseForDay = (
    day: keyof WeeklySchedule,
    exerciseId: string
  ) => {
    setWeeklySchedule((prev) => ({
      ...prev,
      [day]: prev[day].includes(exerciseId)
        ? prev[day].filter((id) => id !== exerciseId)
        : [...prev[day], exerciseId],
    }));
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!name.trim()) {
        alert("Please enter a plan name");
        return;
      }
      if (exercises.length === 0) {
        alert("Please add at least one exercise");
        return;
      }
      // Check if all exercises have names
      const unnamedExercises = exercises.filter((ex) => !ex.name.trim());
      if (unnamedExercises.length > 0) {
        alert("Please provide names for all exercises");
        return;
      }
      setCurrentStep(2);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    }
  };

  const handleSave = () => {
    if (currentStep === 1) {
      handleNextStep();
      return;
    }

    const workoutPlan: WorkoutPlan = {
      id: plan?.id || Date.now().toString(),
      name: name.trim(),
      description: description.trim(),
      exercises,
      weeklySchedule,
      duration,
      createdAt: plan?.createdAt || new Date().toISOString(),
    };

    onSave(workoutPlan);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-gray-800 rounded-xl border border-gray-700/30 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700/30">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold text-white">
                  {plan ? "Edit Workout Plan" : "Create Workout Plan"}
                </h2>
                {/* Step Indicator */}
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      currentStep >= 1
                        ? "bg-gradient-to-r from-red-600 to-pink-600 text-white"
                        : "bg-gray-600 text-gray-400"
                    }`}
                  >
                    1
                  </div>
                  <div
                    className={`w-2 h-0.5 ${
                      currentStep >= 2
                        ? "bg-gradient-to-r from-red-600 to-pink-600"
                        : "bg-gray-600"
                    }`}
                  ></div>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      currentStep >= 2
                        ? "bg-gradient-to-r from-red-600 to-pink-600 text-white"
                        : "bg-gray-600 text-gray-400"
                    }`}
                  >
                    2
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all duration-200"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {currentStep === 1 ? (
                // Step 1: Basic Information and Exercises
                <>
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Plan Name
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all duration-200"
                        placeholder="Enter plan name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Duration (weeks)
                      </label>
                      <input
                        type="number"
                        value={duration}
                        onChange={(e) =>
                          setDuration(parseInt(e.target.value) || 1)
                        }
                        min="1"
                        max="52"
                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all duration-200"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all duration-200"
                      placeholder="Describe your workout plan"
                    />
                  </div>

                  {/* Exercises */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white">
                        Exercises
                      </h3>
                    </div>

                    <div className="space-y-4">
                      {exercises.map((exercise, index) => (
                        <motion.div
                          key={exercise.id}
                          ref={(el) => (exerciseRefs.current[exercise.id] = el)}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/30"
                        >
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-white font-medium">
                              Exercise {index + 1}
                            </h4>
                            <button
                              onClick={() => removeExercise(exercise.id)}
                              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-all duration-200"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-1">
                                Exercise Name
                              </label>
                              <input
                                type="text"
                                value={exercise.name}
                                onChange={(e) =>
                                  updateExercise(exercise.id, {
                                    name: e.target.value,
                                  })
                                }
                                className="w-full px-3 py-2 bg-gray-600/50 border border-gray-500/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all duration-200"
                                placeholder="e.g., Push-ups"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-1">
                                Sets
                              </label>
                              <input
                                type="number"
                                value={exercise.sets}
                                onChange={(e) =>
                                  updateExercise(exercise.id, {
                                    sets: parseInt(e.target.value) || 0,
                                  })
                                }
                                min="1"
                                className="w-full px-3 py-2 bg-gray-600/50 border border-gray-500/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all duration-200"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-1">
                                Reps
                              </label>
                              <input
                                type="number"
                                value={exercise.reps}
                                onChange={(e) =>
                                  updateExercise(exercise.id, {
                                    reps: parseInt(e.target.value) || 0,
                                  })
                                }
                                min="1"
                                className="w-full px-3 py-2 bg-gray-600/50 border border-gray-500/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all duration-200"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-1">
                                Duration (minutes)
                              </label>
                              <input
                                type="number"
                                value={exercise.duration || 0}
                                onChange={(e) =>
                                  updateExercise(exercise.id, {
                                    duration: parseInt(e.target.value) || 0,
                                  })
                                }
                                min="0"
                                className="w-full px-3 py-2 bg-gray-600/50 border border-gray-500/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all duration-200"
                              />
                            </div>
                          </div>

                          <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                              Notes (Optional)
                            </label>
                            <textarea
                              value={exercise.notes || ""}
                              onChange={(e) =>
                                updateExercise(exercise.id, {
                                  notes: e.target.value,
                                })
                              }
                              rows={2}
                              className="w-full px-3 py-2 bg-gray-600/50 border border-gray-500/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all duration-200"
                              placeholder="Any additional notes..."
                            />
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Add Exercise Button - Now positioned after the exercises list */}
                    <div className="mt-6">
                      <button
                        onClick={addExercise}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 rounded-lg font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-red-500/25"
                      >
                        <Plus size={16} />
                        Add Exercise
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                // Step 2: Weekly Schedule
                <>
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-white mb-2">
                      Assign Exercises to Days
                    </h3>
                    <p className="text-gray-400">
                      Select which exercises you want to do on each day of the
                      week
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
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
                    ).map((day) => (
                      <div
                        key={day}
                        className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/30"
                      >
                        <h4 className="text-lg font-semibold text-white mb-4 capitalize">
                          {day}
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          {exercises.map((exercise) => (
                            <label
                              key={exercise.id}
                              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                                weeklySchedule[day].includes(exercise.id)
                                  ? "bg-gradient-to-r from-red-600/20 to-pink-600/20 border-red-500/50"
                                  : "bg-gray-600/30 border-gray-500/50 hover:bg-gray-600/50"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={weeklySchedule[day].includes(
                                  exercise.id
                                )}
                                onChange={() =>
                                  toggleExerciseForDay(day, exercise.id)
                                }
                                className="w-4 h-4 text-red-600 bg-gray-700 border-gray-600 rounded focus:ring-red-500 focus:ring-2"
                              />
                              <div className="flex-1">
                                <div className="font-medium text-white">
                                  {exercise.name}
                                </div>
                                <div className="text-sm text-gray-400">
                                  {exercise.sets} sets × {exercise.reps} reps
                                  {exercise.duration &&
                                    exercise.duration > 0 &&
                                    ` @ ${exercise.duration}min`}
                                </div>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between gap-4 p-6 border-t border-gray-700/30">
              <button
                onClick={onClose}
                className="px-6 py-3 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg font-medium transition-all duration-200"
              >
                Cancel
              </button>

              <div className="flex gap-2">
                {currentStep === 2 && (
                  <button
                    onClick={handlePreviousStep}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg font-medium transition-all duration-200 hover:bg-gray-600/50"
                  >
                    <ArrowLeft size={16} />
                    Previous
                  </button>
                )}

                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 rounded-lg font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-red-500/25"
                >
                  {currentStep === 1 ? (
                    <>
                      Next Step
                      <ArrowRight size={16} />
                    </>
                  ) : (
                    <>{plan ? "Update Plan" : "Create Plan"}</>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WorkoutPlanModal;
