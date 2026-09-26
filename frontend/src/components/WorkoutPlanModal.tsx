import React, { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Plus, Trash2 } from "lucide-react";
import type {
  Exercise,
  WeeklySchedule,
  WorkoutPlan,
  WorkoutPlanModalProps,
} from "@/services/types";
import PaperDialog, { PaperButton } from "./paper/PaperDialog";
import {
  paperErrorText,
  paperIconButton,
  paperInput,
  paperLabel,
  paperTextarea,
} from "@/lib/paper";

const days = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;

const emptySchedule = (): WeeklySchedule => ({
  sunday: [],
  monday: [],
  tuesday: [],
  wednesday: [],
  thursday: [],
  friday: [],
  saturday: [],
});

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
  const [weeklySchedule, setWeeklySchedule] = useState<WeeklySchedule>(emptySchedule);
  const [stepError, setStepError] = useState<string | null>(null);
  const exerciseRefs = useRef<{ [key: string]: HTMLLIElement | null }>({});

  useEffect(() => {
    setName(plan?.name ?? "");
    setDescription(plan?.description ?? "");
    setDuration(plan?.duration ?? 4);
    setExercises(plan?.exercises ?? []);
    setWeeklySchedule(plan?.weeklySchedule || emptySchedule());
    setCurrentStep(1);
    setStepError(null);
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
    setTimeout(() => {
      const el = exerciseRefs.current[newExercise.id];
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      el?.querySelector("input")?.focus();
    }, 100);
  };

  const updateExercise = (id: string, updates: Partial<Exercise>) =>
    setExercises(exercises.map((ex) => (ex.id === id ? { ...ex, ...updates } : ex)));

  const removeExercise = (id: string) => {
    setExercises(exercises.filter((ex) => ex.id !== id));
    setWeeklySchedule((prev) => {
      const next = { ...prev };
      for (const day of days) next[day] = prev[day].filter((exId) => exId !== id);
      return next;
    });
  };

  const toggleExerciseForDay = (day: keyof WeeklySchedule, exerciseId: string) =>
    setWeeklySchedule((prev) => ({
      ...prev,
      [day]: prev[day].includes(exerciseId)
        ? prev[day].filter((id) => id !== exerciseId)
        : [...prev[day], exerciseId],
    }));

  const handleNextStep = () => {
    if (!name.trim()) return setStepError("Give the plan a name.");
    if (exercises.length === 0) return setStepError("Add at least one exercise.");
    if (exercises.some((ex) => !ex.name.trim()))
      return setStepError("Every exercise needs a name.");
    setStepError(null);
    setCurrentStep(2);
  };

  const handleSave = () => {
    if (currentStep === 1) return handleNextStep();

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

  const numberField = (
    exercise: Exercise,
    key: "sets" | "reps" | "duration",
    label: string,
    min: number
  ) => (
    <div>
      <label htmlFor={`${exercise.id}-${key}`} className={paperLabel}>
        {label}
      </label>
      <input
        id={`${exercise.id}-${key}`}
        type="number"
        min={min}
        value={exercise[key] || 0}
        onChange={(e) => updateExercise(exercise.id, { [key]: parseInt(e.target.value) || 0 })}
        className={`${paperInput} font-ledger tabular-nums`}
      />
    </div>
  );

  return (
    <PaperDialog
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      title={plan ? "Edit workout plan" : "A new workout plan"}
      description={
        currentStep === 1
          ? "Step 1 of 2 · the plan and its exercises"
          : "Step 2 of 2 · which exercises go on which day"
      }
      size="lg"
    >
      <div className="space-y-8">
        {currentStep === 1 ? (
          <>
            <div className="grid gap-6 sm:grid-cols-[1fr_8rem]">
              <div>
                <label htmlFor="workout-name" className={paperLabel}>
                  Name
                </label>
                <input
                  id="workout-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`${paperInput} text-lg`}
                  placeholder="Strength, three days a week"
                  autoFocus
                />
              </div>
              <div>
                <label htmlFor="workout-duration" className={paperLabel}>
                  Weeks
                </label>
                <input
                  id="workout-duration"
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
              <label htmlFor="workout-description" className={paperLabel}>
                Notes
              </label>
              <textarea
                id="workout-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className={`${paperTextarea} mt-2 resize-none`}
                placeholder="Optional"
              />
            </div>

            <div>
              <p className={`${paperLabel} border-b border-ink pb-2`}>Exercises</p>
              <ol>
                {exercises.map((exercise, index) => (
                  <li
                    key={exercise.id}
                    ref={(el) => (exerciseRefs.current[exercise.id] = el)}
                    className="border-b border-paper-rule py-5"
                  >
                    <div className="flex items-end gap-3">
                      <span className="pb-2 font-ledger text-[11px] text-ink-faint">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div className="flex-1">
                        <label htmlFor={`${exercise.id}-name`} className="sr-only">
                          Exercise name
                        </label>
                        <input
                          id={`${exercise.id}-name`}
                          type="text"
                          value={exercise.name}
                          onChange={(e) => updateExercise(exercise.id, { name: e.target.value })}
                          className={`${paperInput} text-lg`}
                          placeholder="e.g. Push-ups"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeExercise(exercise.id)}
                        className={`${paperIconButton} hover:text-clay`}
                        aria-label={`Remove ${exercise.name || `exercise ${index + 1}`}`}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-4 pl-7">
                      {numberField(exercise, "sets", "Sets", 1)}
                      {numberField(exercise, "reps", "Reps", 1)}
                      {numberField(exercise, "duration", "Minutes", 0)}
                    </div>
                    <div className="mt-4 pl-7">
                      <label htmlFor={`${exercise.id}-notes`} className="sr-only">
                        Notes
                      </label>
                      <input
                        id={`${exercise.id}-notes`}
                        value={exercise.notes || ""}
                        onChange={(e) => updateExercise(exercise.id, { notes: e.target.value })}
                        className={`${paperInput} text-sm`}
                        placeholder="Notes (optional)"
                      />
                    </div>
                  </li>
                ))}
              </ol>
              <PaperButton type="button" tone="quiet" onClick={addExercise} className="mt-4">
                <Plus size={16} />
                Add exercise
              </PaperButton>
            </div>
          </>
        ) : (
          <ol className="border-t border-ink">
            {days.map((day) => (
              <li key={day} className="border-b border-paper-rule py-4">
                <fieldset>
                  <legend className="font-display text-xl capitalize">{day}</legend>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {exercises.map((exercise) => {
                      const checked = weeklySchedule[day].includes(exercise.id);
                      return (
                        <label
                          key={exercise.id}
                          className={`cursor-pointer rounded-full border px-3 py-1 text-sm transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-clay ${
                            checked
                              ? "border-ink bg-ink text-paper"
                              : "border-ink/25 text-ink-soft hover:border-ink hover:text-ink"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleExerciseForDay(day, exercise.id)}
                            className="sr-only"
                          />
                          {exercise.name}
                          <span className="ml-1.5 font-ledger text-[10px] opacity-70">
                            {exercise.sets}×{exercise.reps}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
              </li>
            ))}
          </ol>
        )}

        {stepError && (
          <p role="alert" className={paperErrorText}>
            {stepError}
          </p>
        )}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
          <PaperButton type="button" tone="quiet" onClick={onClose}>
            Cancel
          </PaperButton>
          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            {currentStep === 2 && (
              <PaperButton type="button" tone="quiet" onClick={() => setCurrentStep(1)}>
                <ArrowLeft size={16} />
                Back
              </PaperButton>
            )}
            <PaperButton type="button" onClick={handleSave}>
              {currentStep === 1 ? (
                <>
                  Next: the week
                  <ArrowRight size={16} />
                </>
              ) : plan ? (
                "Save plan"
              ) : (
                "Create plan"
              )}
            </PaperButton>
          </div>
        </div>
      </div>
    </PaperDialog>
  );
};

export default WorkoutPlanModal;
