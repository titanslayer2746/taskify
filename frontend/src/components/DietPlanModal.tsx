import React, { useEffect, useRef, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { DietPlan, DietPlanModalProps, Meal } from "@/services/types";
import PaperDialog, { PaperButton } from "./paper/PaperDialog";
import {
  paperErrorText,
  paperIconButton,
  paperInput,
  paperLabel,
  paperSelect,
  paperTextarea,
} from "@/lib/paper";

const mealTypeOptions = [
  { value: "breakfast", label: "Breakfast" },
  { value: "lunch", label: "Lunch" },
  { value: "dinner", label: "Dinner" },
  { value: "snack", label: "Snack" },
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
  const [formError, setFormError] = useState<string | null>(null);
  const mealRefs = useRef<{ [key: string]: HTMLLIElement | null }>({});

  useEffect(() => {
    setName(plan?.name ?? "");
    setDescription(plan?.description ?? "");
    setDuration(plan?.duration ?? 4);
    setMeals(plan?.meals ?? []);
    setFormError(null);
  }, [plan, isOpen]);

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
    setTimeout(() => {
      const el = mealRefs.current[newMeal.id];
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      el?.querySelector("input")?.focus();
    }, 100);
  };

  const updateMeal = (id: string, updates: Partial<Meal>) =>
    setMeals(meals.map((meal) => (meal.id === id ? { ...meal, ...updates } : meal)));

  const handleSave = () => {
    if (!name.trim()) return setFormError("Give the plan a name.");
    if (meals.length === 0) return setFormError("Add at least one meal.");

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
    <PaperDialog
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      title={plan ? "Edit meal plan" : "A new meal plan"}
      size="lg"
    >
      <div className="space-y-8">
        <div className="grid gap-6 sm:grid-cols-[1fr_8rem]">
          <div>
            <label htmlFor="diet-name" className={paperLabel}>
              Name
            </label>
            <input
              id="diet-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`${paperInput} text-lg`}
              placeholder="Weekday eating"
              autoFocus
            />
          </div>
          <div>
            <label htmlFor="diet-duration" className={paperLabel}>
              Weeks
            </label>
            <input
              id="diet-duration"
              type="number"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value) || 1)}
              min="1"
              max="52"
              className={`${paperInput} font-ledger tabular-nums`}
            />
          </div>
        </div>

        <div>
          <label htmlFor="diet-description" className={paperLabel}>
            Notes
          </label>
          <textarea
            id="diet-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className={`${paperTextarea} mt-2 resize-none`}
            placeholder="Optional"
          />
        </div>

        <div>
          <p className={`${paperLabel} border-b border-ink pb-2`}>Meals</p>
          <ol>
            {meals.map((meal, index) => (
              <li
                key={meal.id}
                ref={(el) => (mealRefs.current[meal.id] = el)}
                className="border-b border-paper-rule py-5"
              >
                <div className="flex items-end gap-3">
                  <span className="pb-2 font-ledger text-[11px] text-ink-faint">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="flex-1">
                    <label htmlFor={`${meal.id}-name`} className="sr-only">
                      Meal name
                    </label>
                    <input
                      id={`${meal.id}-name`}
                      type="text"
                      value={meal.name}
                      onChange={(e) => updateMeal(meal.id, { name: e.target.value })}
                      className={`${paperInput} text-lg`}
                      placeholder="e.g. Oats with fruit"
                    />
                  </div>
                  <div className="w-32">
                    <label htmlFor={`${meal.id}-type`} className="sr-only">
                      Meal type
                    </label>
                    <select
                      id={`${meal.id}-type`}
                      value={meal.type}
                      onChange={(e) =>
                        updateMeal(meal.id, { type: e.target.value as Meal["type"] })
                      }
                      className={paperSelect}
                    >
                      {mealTypeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMeals(meals.filter((m) => m.id !== meal.id))}
                    className={`${paperIconButton} hover:text-clay`}
                    aria-label={`Remove ${meal.name || `meal ${index + 1}`}`}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
                <div className="mt-4 pl-7">
                  <label htmlFor={`${meal.id}-notes`} className="sr-only">
                    Notes
                  </label>
                  <input
                    id={`${meal.id}-notes`}
                    value={meal.notes || ""}
                    onChange={(e) => updateMeal(meal.id, { notes: e.target.value })}
                    className={`${paperInput} text-sm`}
                    placeholder="Notes (optional)"
                  />
                </div>
              </li>
            ))}
          </ol>
          <PaperButton type="button" tone="quiet" onClick={addMeal} className="mt-4">
            <Plus size={16} />
            Add meal
          </PaperButton>
        </div>

        {formError && (
          <p role="alert" className={paperErrorText}>
            {formError}
          </p>
        )}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <PaperButton type="button" tone="quiet" onClick={onClose}>
            Cancel
          </PaperButton>
          <PaperButton type="button" onClick={handleSave}>
            {plan ? "Save plan" : "Create plan"}
          </PaperButton>
        </div>
      </div>
    </PaperDialog>
  );
};

export default DietPlanModal;
