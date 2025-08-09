import React, { useState, useEffect, useRef } from "react";
import { X, Plus, Trash2, Utensils, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Food {
  id: string;
  name: string;
  quantity: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

interface Meal {
  id: string;
  name: string;
  type: "breakfast" | "lunch" | "dinner" | "snack";
  foods: Food[];
  calories: number;
  notes?: string;
}

interface DietPlan {
  id: string;
  name: string;
  description: string;
  meals: Meal[];
  duration: number;
  createdAt: string;
}

interface DietPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (plan: DietPlan) => void;
  plan?: DietPlan | null;
}

const mealTypeOptions = [
  { value: "breakfast", label: "Breakfast", icon: "🌅" },
  { value: "lunch", label: "Lunch", icon: "🌞" },
  { value: "dinner", label: "Dinner", icon: "🌙" },
  { value: "snack", label: "Snack", icon: "🍎" },
] as const;

const DietPlanModal: React.FC<DietPlanModalProps> = ({
  isOpen,
  onClose,
  onSave,
  plan,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState(4);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const mealRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    if (plan) {
      setName(plan.name);
      setDescription(plan.description);
      setDuration(plan.duration);
      setMeals(plan.meals);
    } else {
      setName("");
      setDescription("");
      setDuration(4);
      setMeals([]);
    }
  }, [plan, isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdownId) {
        const dropdownRef = dropdownRefs.current[openDropdownId];
        if (dropdownRef && !dropdownRef.contains(event.target as Node)) {
          setOpenDropdownId(null);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openDropdownId]);

  const addMeal = () => {
    const newMeal: Meal = {
      id: Date.now().toString(),
      name: "",
      type: "breakfast",
      foods: [],
      calories: 0,
      notes: "",
    };
    setMeals([...meals, newMeal]);

    // Scroll to the new meal after it's added
    setTimeout(() => {
      const newMealElement = mealRefs.current[newMeal.id];
      if (newMealElement) {
        newMealElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }, 100);
  };

  const updateMeal = (id: string, updates: Partial<Meal>) => {
    setMeals(
      meals.map((meal) => (meal.id === id ? { ...meal, ...updates } : meal))
    );
  };

  const removeMeal = (id: string) => {
    setMeals(meals.filter((meal) => meal.id !== id));
  };

  const addFood = (mealId: string) => {
    const newFood: Food = {
      id: Date.now().toString(),
      name: "",
      quantity: "",
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    };
    setMeals(
      meals.map((meal) =>
        meal.id === mealId ? { ...meal, foods: [...meal.foods, newFood] } : meal
      )
    );
  };

  const updateFood = (
    mealId: string,
    foodId: string,
    updates: Partial<Food>
  ) => {
    setMeals(
      meals.map((meal) =>
        meal.id === mealId
          ? {
              ...meal,
              foods: meal.foods.map((food) =>
                food.id === foodId ? { ...food, ...updates } : food
              ),
            }
          : meal
      )
    );
  };

  const removeFood = (mealId: string, foodId: string) => {
    setMeals(
      meals.map((meal) =>
        meal.id === mealId
          ? { ...meal, foods: meal.foods.filter((food) => food.id !== foodId) }
          : meal
      )
    );
  };

  const calculateMealCalories = (foods: Food[]) => {
    return foods.reduce((total, food) => total + food.calories, 0);
  };

  const getCurrentMealTypeLabel = (mealType: string) => {
    const option = mealTypeOptions.find((opt) => opt.value === mealType);
    return option ? option.label : "Select type";
  };

  const getCurrentMealTypeIcon = (mealType: string) => {
    const option = mealTypeOptions.find((opt) => opt.value === mealType);
    return option ? option.icon : "🍽️";
  };

  const handleSave = () => {
    if (!name.trim()) {
      alert("Please enter a plan name");
      return;
    }

    if (meals.length === 0) {
      alert("Please add at least one meal");
      return;
    }

    const dietPlan: DietPlan = {
      id: plan?.id || Date.now().toString(),
      name: name.trim(),
      description: description.trim(),
      meals,
      duration,
      createdAt: plan?.createdAt || new Date().toISOString(),
    };

    onSave(dietPlan);
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
              <h2 className="text-2xl font-bold text-white">
                {plan ? "Edit Diet Plan" : "Create Diet Plan"}
              </h2>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all duration-200"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
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
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all duration-200"
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
                    onChange={(e) => setDuration(parseInt(e.target.value) || 1)}
                    min="1"
                    max="52"
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all duration-200"
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
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all duration-200"
                  placeholder="Describe your diet plan"
                />
              </div>

              {/* Meals */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Meals</h3>
                </div>

                <div className="space-y-6">
                  {meals.map((meal, index) => (
                    <motion.div
                      key={meal.id}
                      ref={(el) => (mealRefs.current[meal.id] = el)}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/30"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-white font-medium">
                          Meal {index + 1}
                        </h4>
                        <button
                          onClick={() => removeMeal(meal.id)}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-all duration-200"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            Meal Name
                          </label>
                          <input
                            type="text"
                            value={meal.name}
                            onChange={(e) =>
                              updateMeal(meal.id, { name: e.target.value })
                            }
                            className="w-full px-3 py-2 bg-gray-600/50 border border-gray-500/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all duration-200"
                            placeholder="e.g., Breakfast"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            Meal Type
                          </label>
                          <div
                            className="relative"
                            ref={(el) => (dropdownRefs.current[meal.id] = el)}
                          >
                            <button
                              onClick={() =>
                                setOpenDropdownId(
                                  openDropdownId === meal.id ? null : meal.id
                                )
                              }
                              className="w-full flex items-center justify-between px-3 py-2 bg-gray-600/50 border border-gray-500/50 rounded-lg text-white hover:bg-gray-600/70 hover:border-gray-400/50 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all duration-200"
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-lg">
                                  {getCurrentMealTypeIcon(meal.type)}
                                </span>
                                <span className="font-medium">
                                  {getCurrentMealTypeLabel(meal.type)}
                                </span>
                              </div>
                              <ChevronDown
                                size={16}
                                className={`transition-transform duration-200 ${
                                  openDropdownId === meal.id ? "rotate-180" : ""
                                }`}
                              />
                            </button>

                            <AnimatePresence>
                              {openDropdownId === meal.id && (
                                <motion.div
                                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                  animate={{ opacity: 1, y: 0, scale: 1 }}
                                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                  transition={{
                                    duration: 0.15,
                                    ease: "easeOut",
                                  }}
                                  className="absolute top-full left-0 mt-2 w-full bg-gray-800/95 backdrop-blur-sm border border-gray-700/50 rounded-xl shadow-2xl z-50 overflow-hidden"
                                >
                                  <div className="py-1">
                                    {mealTypeOptions.map(
                                      (option, optionIndex) => (
                                        <button
                                          key={option.value}
                                          onClick={() => {
                                            updateMeal(meal.id, {
                                              type: option.value,
                                            });
                                            setOpenDropdownId(null);
                                          }}
                                          className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-200 ${
                                            meal.type === option.value
                                              ? "bg-green-500/20 text-green-400 border-r-2 border-green-500"
                                              : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                                          } ${
                                            optionIndex === 0
                                              ? "rounded-t-xl"
                                              : ""
                                          } ${
                                            optionIndex ===
                                            mealTypeOptions.length - 1
                                              ? "rounded-b-xl"
                                              : ""
                                          }`}
                                        >
                                          <span className="text-lg">
                                            {option.icon}
                                          </span>
                                          <span className="flex-1 text-left">
                                            {option.label}
                                          </span>
                                          {meal.type === option.value && (
                                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                          )}
                                        </button>
                                      )
                                    )}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </div>

                      {/* Foods */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="text-white font-medium">Foods</h5>
                          <button
                            onClick={() => addFood(meal.id)}
                            className="flex items-center gap-1 px-2 py-1 bg-green-600/50 text-green-300 rounded text-sm hover:bg-green-600 transition-colors"
                          >
                            <Plus size={12} />
                            Add Food
                          </button>
                        </div>

                        <div className="space-y-2">
                          {meal.foods.map((food, foodIndex) => (
                            <div
                              key={food.id}
                              className="flex items-center gap-2 p-2 bg-gray-600/30 rounded border border-gray-500/30"
                            >
                              <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-2">
                                <input
                                  type="text"
                                  value={food.name}
                                  onChange={(e) =>
                                    updateFood(meal.id, food.id, {
                                      name: e.target.value,
                                    })
                                  }
                                  className="px-2 py-1 bg-gray-500/50 border border-gray-400/50 rounded text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-green-500/50"
                                  placeholder="Food name"
                                />
                                <input
                                  type="text"
                                  value={food.quantity}
                                  onChange={(e) =>
                                    updateFood(meal.id, food.id, {
                                      quantity: e.target.value,
                                    })
                                  }
                                  className="px-2 py-1 bg-gray-500/50 border border-gray-400/50 rounded text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-green-500/50"
                                  placeholder="Quantity"
                                />
                                <input
                                  type="number"
                                  value={food.calories}
                                  onChange={(e) =>
                                    updateFood(meal.id, food.id, {
                                      calories: parseInt(e.target.value) || 0,
                                    })
                                  }
                                  className="px-2 py-1 bg-gray-500/50 border border-gray-400/50 rounded text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-green-500/50"
                                  placeholder="Calories"
                                />
                                <input
                                  type="number"
                                  value={food.protein || 0}
                                  onChange={(e) =>
                                    updateFood(meal.id, food.id, {
                                      protein: parseFloat(e.target.value) || 0,
                                    })
                                  }
                                  className="px-2 py-1 bg-gray-500/50 border border-gray-400/50 rounded text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-green-500/50"
                                  placeholder="Protein (g)"
                                />
                              </div>
                              <button
                                onClick={() => removeFood(meal.id, food.id)}
                                className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded transition-colors"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Notes (Optional)
                        </label>
                        <textarea
                          value={meal.notes || ""}
                          onChange={(e) =>
                            updateMeal(meal.id, { notes: e.target.value })
                          }
                          rows={2}
                          className="w-full px-3 py-2 bg-gray-600/50 border border-gray-500/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all duration-200"
                          placeholder="Any additional notes..."
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Add Meal Button - positioned after the meals list */}
                <div className="mt-6">
                  <button
                    onClick={addMeal}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-green-500/25"
                  >
                    <Plus size={16} />
                    Add Meal
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-4 p-6 border-t border-gray-700/30">
              <button
                onClick={onClose}
                className="px-6 py-3 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg font-medium transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-green-500/25"
              >
                {plan ? "Update Plan" : "Create Plan"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DietPlanModal;
