import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import PaperPage, {
  PaperEmpty,
  PaperErrorState,
  PaperLoading,
} from "../components/paper/PaperPage";
import { PaperButton } from "../components/paper/PaperDialog";
import { paperIconButton, paperKicker, paperSheet, todayDateline } from "@/lib/paper";
import WorkoutPlanModal from "../components/WorkoutPlanModal";
import DietPlanModal from "../components/DietPlanModal";
import ConfirmationDialog from "../components/ConfirmationDialog";
import { apiService } from "../services/api";
import { useApi } from "../hooks/useApi";
import { useToast } from "../hooks/use-toast";
import type { DietPlan, WorkoutPlan } from "@/services/types";
import { BookOpen, Edit, Plus, Trash2 } from "lucide-react";

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
    type: "workout" | "diet";
  }>({
    isOpen: false,
    planId: null,
    planName: "",
    type: "workout",
  });

  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();

  // API hooks for workout plans
  const getWorkoutPlansApi = useApi(apiService.getWorkoutPlans);
  const createWorkoutPlanApi = useApi(apiService.createWorkoutPlan);
  const updateWorkoutPlanApi = useApi(apiService.updateWorkoutPlan);
  const deleteWorkoutPlanApi = useApi(apiService.deleteWorkoutPlan);

  // API hooks for diet plans
  const getDietPlansApi = useApi(apiService.getDietPlans);
  const createDietPlanApi = useApi(apiService.createDietPlan);
  const updateDietPlanApi = useApi(apiService.updateDietPlan);
  const deleteDietPlanApi = useApi(apiService.deleteDietPlan);

  // API hooks for journal entries
  const createJournalEntryApi = useApi(apiService.createJournalEntry);

  // Load workout plans from API
  useEffect(() => {
    loadWorkoutPlans();
  }, []);

  const loadWorkoutPlans = async () => {
    const result = await getWorkoutPlansApi.execute();
    if (result?.data?.plans) {
      setWorkoutPlans(result.data.plans);
    }
  };

  // Load diet plans from API
  useEffect(() => {
    loadDietPlans();
  }, []);

  const loadDietPlans = async () => {
    const result = await getDietPlansApi.execute();
    if (result?.data?.plans) {
      setDietPlans(result.data.plans);
    }
  };

  const createWorkoutNote = async () => {
    try {
      const title = `Workout — ${todayDateline()}`;

      // Create a new journal entry with workout tag using API
      const result = await createJournalEntryApi.execute({
        title,
        content: "",
        tags: ["workout"],
      });

      if (result?.data?.entry) {
        // Navigate to the new journal entry
        window.open(`/journal/${result.data.entry.id}`, "_blank");
        toast({
          title: "Success",
          description: "Workout journal entry created successfully!",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          "Failed to create workout journal entry. Please try again.",
        variant: "destructive",
      });
    }
  };

  const createDietNote = async () => {
    try {
      const title = `Food — ${todayDateline()}`;

      // Create a new journal entry with diet tag using API
      const result = await createJournalEntryApi.execute({
        title,
        content: "",
        tags: ["diet"],
      });

      if (result?.data?.entry) {
        // Navigate to the new journal entry
        window.open(`/journal/${result.data.entry.id}`, "_blank");
        toast({
          title: "Success",
          description: "Diet journal entry created successfully!",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create diet journal entry. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSaveWorkoutPlan = async (plan: WorkoutPlan) => {
    try {
      if (editingWorkoutPlan) {
        // Update existing plan
        const result = await updateWorkoutPlanApi.execute(plan.id, plan);
        if (result?.data?.plan) {
          setWorkoutPlans(
            workoutPlans.map((p) => (p.id === plan.id ? result.data.plan : p))
          );
          setEditingWorkoutPlan(null);
          toast({
            title: "Success",
            description: "Workout plan updated successfully!",
          });
        }
      } else {
        // Create new plan
        const result = await createWorkoutPlanApi.execute(plan);
        if (result?.data?.plan) {
          setWorkoutPlans([result.data.plan, ...workoutPlans]);
          toast({
            title: "Success",
            description: "Workout plan created successfully!",
          });
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save workout plan. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSaveDietPlan = async (plan: DietPlan) => {
    try {
      if (editingDietPlan) {
        // Update existing plan
        const result = await updateDietPlanApi.execute(plan.id, plan);
        if (result?.data?.plan) {
          setDietPlans(
            dietPlans.map((p) => (p.id === plan.id ? result.data.plan : p))
          );
          setEditingDietPlan(null);
          toast({
            title: "Success",
            description: "Diet plan updated successfully!",
          });
        }
      } else {
        // Create new plan
        const result = await createDietPlanApi.execute(plan);
        if (result?.data?.plan) {
          setDietPlans([result.data.plan, ...dietPlans]);
          toast({
            title: "Success",
            description: "Diet plan created successfully!",
          });
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save diet plan. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteWorkoutPlan = async (planId: string) => {
    try {
      const result = await deleteWorkoutPlanApi.execute(planId);
      if (result) {
        setWorkoutPlans(workoutPlans.filter((p) => p.id !== planId));
        toast({
          title: "Success",
          description: "Workout plan deleted successfully!",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete workout plan. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteClick = (planId: string, planName: string) => {
    setDeleteConfirmation({
      isOpen: true,
      planId,
      planName,
      type: "workout",
    });
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmation.planId) {
      if (deleteConfirmation.type === "workout") {
        handleDeleteWorkoutPlan(deleteConfirmation.planId);
      } else if (deleteConfirmation.type === "diet") {
        handleDeleteDietPlan(deleteConfirmation.planId);
      }
      setDeleteConfirmation({
        isOpen: false,
        planId: null,
        planName: "",
        type: "workout",
      });
    }
  };

  const handleDeleteDietPlan = async (planId: string) => {
    try {
      const result = await deleteDietPlanApi.execute(planId);
      if (result) {
        setDietPlans(dietPlans.filter((p) => p.id !== planId));
        toast({
          title: "Success",
          description: "Diet plan deleted successfully!",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete diet plan. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteDietPlanClick = (planId: string) => {
    const plan = dietPlans.find((p) => p.id === planId);
    if (plan) {
      setDeleteConfirmation({
        isOpen: true,
        planId,
        planName: plan.name,
        type: "diet",
      });
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

  const planModals = (
    <>
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
    </>
  );

  const days = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ] as const;
  const todayName = new Date()
    .toLocaleDateString("en-US", { weekday: "long" })
    .toLowerCase();

  const emptySchedule = {
    sunday: [],
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
  };

  const detailsList = (rows: { label: string; value: React.ReactNode }[]) => (
    <dl className="border-t border-ink font-ledger text-[13px]">
      {rows.map((row) => (
        <div
          key={row.label}
          className="flex items-baseline justify-between border-b border-paper-rule py-2.5"
        >
          <dt className="text-ink-soft">{row.label}</dt>
          <dd className="tabular-nums">{row.value}</dd>
        </div>
      ))}
    </dl>
  );

  if (currentWorkoutPlan) {
    // Older plans may not have a weekly schedule yet.
    const plan = {
      ...currentWorkoutPlan,
      weeklySchedule: currentWorkoutPlan.weeklySchedule || emptySchedule,
    };

    return (
      <PaperPage
        number="07"
        title={plan.name}
        kicker="07 — Health · Workout plan"
        subtitle={plan.description || undefined}
        back={{ to: "/health", label: "All plans" }}
        actions={
          <PaperButton tone="quiet" onClick={() => handleEditWorkoutPlan(currentWorkoutPlan)}>
            <Edit size={16} />
            Edit plan
          </PaperButton>
        }
      >
        <div className="mt-12 grid gap-12 lg:grid-cols-12">
          <section aria-label="Weekly schedule" className="lg:col-span-8">
            <ol className="border-t border-ink">
              {days.map((day) => {
                const exercises = plan.weeklySchedule[day]
                  .map((exerciseId) => plan.exercises.find((ex) => ex.id === exerciseId))
                  .filter(Boolean);
                const isToday = day === todayName;
                return (
                  <li
                    key={day}
                    id={`workout-day-${day}`}
                    className={`border-b border-paper-rule py-5 ${
                      isToday ? "-mx-4 rounded-[3px] bg-[#F9F7EF] px-4 shadow-[0_1px_0_#d3cdb7]" : ""
                    }`}
                  >
                    <div className="flex items-baseline justify-between gap-4">
                      <h2 className="font-display text-2xl capitalize">
                        {day}
                        {isToday && (
                          <span className="ml-3 font-ledger text-[10px] uppercase tracking-[0.16em] text-clay">
                            Today
                          </span>
                        )}
                      </h2>
                      <span className="font-ledger text-[11px] text-ink-faint">
                        {exercises.length
                          ? `${exercises.length} ${exercises.length === 1 ? "exercise" : "exercises"}`
                          : "Rest"}
                      </span>
                    </div>
                    {exercises.length > 0 && (
                      <ul className="mt-3 space-y-2">
                        {exercises.map((exercise) => (
                          <li key={exercise!.id}>
                            <div className="flex items-baseline gap-3">
                              <span className="text-[15px]">{exercise!.name}</span>
                              <span className="paper-leader" />
                              <span className="font-ledger text-[13px] tabular-nums">
                                {exercise!.sets} × {exercise!.reps}
                              </span>
                            </div>
                            {exercise!.notes && (
                              <p className="mt-0.5 text-sm text-ink-faint">{exercise!.notes}</p>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ol>
          </section>

          <aside className="lg:col-span-4">
            <p className={`mb-4 ${paperKicker}`}>About this plan</p>
            {detailsList([
              { label: "Length", value: `${currentWorkoutPlan.duration} weeks` },
              { label: "Exercises", value: currentWorkoutPlan.exercises.length },
              {
                label: "Training days",
                value: days.filter((d) => plan.weeklySchedule[d].length > 0).length,
              },
              {
                label: "Started",
                value: new Date(currentWorkoutPlan.createdAt).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                }),
              },
            ])}
            <button
              onClick={createWorkoutNote}
              className="paper-focus ink-link mt-6 text-sm text-ink-soft hover:text-ink"
            >
              Write today's workout note
            </button>
          </aside>
        </div>

        {planModals}
      </PaperPage>
    );
  }

  if (currentDietPlan) {
    const dayCalories = currentDietPlan.meals.reduce(
      (sum, meal) => sum + (meal.foods || []).reduce((s, f) => s + (f.calories || 0), 0),
      0
    );

    return (
      <PaperPage
        number="07"
        title={currentDietPlan.name}
        kicker="07 — Health · Meal plan"
        subtitle={currentDietPlan.description || undefined}
        back={{ to: "/health", label: "All plans" }}
        actions={
          <PaperButton tone="quiet" onClick={() => handleEditDietPlan(currentDietPlan)}>
            <Edit size={16} />
            Edit plan
          </PaperButton>
        }
      >
        <div className="mt-12 grid gap-12 lg:grid-cols-12">
          <section aria-label="Meals" className="space-y-10 lg:col-span-8">
            {currentDietPlan.meals.map((meal) => {
              const calories = (meal.foods || []).reduce((s, f) => s + (f.calories || 0), 0);
              return (
                <article key={meal.id} className="border-t border-ink pt-4">
                  <div className="flex items-baseline justify-between gap-4">
                    <div>
                      <p className={paperKicker}>{meal.type}</p>
                      <h2 className="mt-1 font-display text-3xl">{meal.name}</h2>
                    </div>
                    {calories > 0 && (
                      <span className="font-ledger text-sm tabular-nums">{calories} kcal</span>
                    )}
                  </div>
                  {meal.foods && meal.foods.length > 0 && (
                    <ul className="mt-4 space-y-2">
                      {meal.foods.map((food) => (
                        <li key={food.id} className="flex items-baseline gap-3">
                          <span className="text-[15px]">
                            {food.name}
                            <span className="ml-2 text-sm text-ink-faint">{food.quantity}</span>
                          </span>
                          <span className="paper-leader" />
                          <span className="font-ledger text-[13px] tabular-nums">
                            {food.calories} kcal
                            {food.protein ? (
                              <span className="ml-2 text-ink-faint">{food.protein}g protein</span>
                            ) : null}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {meal.notes && (
                    <p className="mt-4 font-display text-lg italic text-ink-soft">{meal.notes}</p>
                  )}
                </article>
              );
            })}
          </section>

          <aside className="lg:col-span-4">
            <p className={`mb-4 ${paperKicker}`}>About this plan</p>
            {detailsList([
              { label: "Length", value: `${currentDietPlan.duration} weeks` },
              { label: "Meals a day", value: currentDietPlan.meals.length },
              ...(dayCalories > 0
                ? [{ label: "Calories a day", value: `${dayCalories} kcal` }]
                : []),
              {
                label: "Started",
                value: new Date(currentDietPlan.createdAt).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                }),
              },
            ])}
            <button
              onClick={createDietNote}
              className="paper-focus ink-link mt-6 text-sm text-ink-soft hover:text-ink"
            >
              Write today's food note
            </button>
          </aside>
        </div>

        {planModals}
      </PaperPage>
    );
  }

  const isWorkout = activeTab === "workout";
  const listApi = isWorkout ? getWorkoutPlansApi : getDietPlansApi;
  const plansCount = isWorkout ? workoutPlans.length : dietPlans.length;

  return (
    <PaperPage number="07" title="Health" subtitle="Plans for moving and eating.">
      <div className="mt-10 flex flex-wrap items-end justify-between gap-6">
        <div role="tablist" aria-label="Plan type" className="flex gap-8">
          {(
            [
              { id: "workout", label: "Workouts", count: workoutPlans.length },
              { id: "diet", label: "Meals", count: dietPlans.length },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`paper-focus relative pb-1 font-display text-3xl ${
                activeTab === tab.id
                  ? "text-ink after:absolute after:inset-x-0 after:-bottom-px after:h-[2px] after:bg-clay"
                  : "text-ink-faint hover:text-ink"
              }`}
            >
              {tab.label}
              <span className="ml-2 font-ledger text-xs text-ink-faint">{tab.count}</span>
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <PaperButton tone="quiet" onClick={isWorkout ? createWorkoutNote : createDietNote}>
            <BookOpen size={16} />
            Today's note
          </PaperButton>
          <PaperButton
            onClick={() => (isWorkout ? setIsWorkoutModalOpen(true) : setIsDietModalOpen(true))}
          >
            <Plus size={16} />
            New plan
          </PaperButton>
        </div>
      </div>

      {listApi.loading ? (
        <PaperLoading label="Opening your plans…" />
      ) : listApi.error ? (
        <PaperErrorState
          message={listApi.error.message}
          onRetry={isWorkout ? loadWorkoutPlans : loadDietPlans}
        />
      ) : plansCount === 0 ? (
        <PaperEmpty
          title={isWorkout ? "No workout plans yet." : "No meal plans yet."}
          body={
            isWorkout
              ? "Write down the exercises, sets and reps, and which days they go on."
              : "Write down your meals, what's in them and roughly how much."
          }
          action={
            <PaperButton
              onClick={() => (isWorkout ? setIsWorkoutModalOpen(true) : setIsDietModalOpen(true))}
            >
              <Plus size={16} />
              Make your first plan
            </PaperButton>
          }
        />
      ) : (
        <ul className="mt-8 grid gap-6 md:grid-cols-2">
          {isWorkout
            ? workoutPlans.map((plan) => {
                const schedule = plan.weeklySchedule || emptySchedule;
                const activeDays = days.filter((d) => schedule[d].length > 0).length;
                return (
                  <li key={plan.id} className={`flex flex-col ${paperSheet} p-6`}>
                    <h3 className="font-display text-3xl leading-tight">
                      <Link
                        to={`/health/workout/${plan.id}`}
                        className="paper-focus hover:text-clay"
                      >
                        {plan.name}
                      </Link>
                    </h3>
                    {plan.description && (
                      <p className="mt-2 line-clamp-2 text-ink-soft">{plan.description}</p>
                    )}
                    <div className="mt-5 grid grid-cols-7 gap-1.5" aria-label="Week at a glance">
                      {days.map((day) => {
                        const count = schedule[day].length;
                        return (
                          <div key={day} className="text-center">
                            <p
                              className={`font-ledger text-[10px] uppercase ${
                                day === todayName ? "text-clay" : "text-ink-faint"
                              }`}
                            >
                              {day.slice(0, 2)}
                            </p>
                            <p
                              className={`mt-1 grid h-7 place-items-center rounded-[2px] font-ledger text-xs ${
                                count ? "bg-ink text-paper" : "border border-ink/15 text-ink-faint"
                              }`}
                              title={`${day}: ${count || "rest"}`}
                            >
                              {count || "·"}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-auto flex items-center justify-between gap-4 pt-6">
                      <p className="font-ledger text-[11px] text-ink-faint">
                        {plan.exercises.length} exercises · {activeDays} days
                      </p>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEditWorkoutPlan(plan)}
                          className={paperIconButton}
                          aria-label={`Edit ${plan.name}`}
                        >
                          <Edit size={15} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(plan.id, plan.name)}
                          className={`${paperIconButton} hover:text-clay`}
                          aria-label={`Delete ${plan.name}`}
                        >
                          <Trash2 size={15} />
                        </button>
                        <Link
                          to={`/health/workout/${plan.id}`}
                          className="paper-focus ink-link ml-2 text-sm"
                        >
                          Open
                        </Link>
                      </div>
                    </div>
                  </li>
                );
              })
            : dietPlans.map((plan) => {
                const calories = plan.meals.reduce(
                  (sum, meal) =>
                    sum + (meal.foods || []).reduce((s, f) => s + (f.calories || 0), 0),
                  0
                );
                return (
                  <li key={plan.id} className={`flex flex-col ${paperSheet} p-6`}>
                    <h3 className="font-display text-3xl leading-tight">
                      <Link to={`/health/diet/${plan.id}`} className="paper-focus hover:text-clay">
                        {plan.name}
                      </Link>
                    </h3>
                    {plan.description && (
                      <p className="mt-2 line-clamp-2 text-ink-soft">{plan.description}</p>
                    )}
                    <ul className="mt-5 space-y-1.5">
                      {plan.meals.slice(0, 4).map((meal) => (
                        <li key={meal.id} className="flex items-baseline gap-3 text-[15px]">
                          <span className="font-ledger text-[10px] uppercase tracking-[0.12em] text-ink-faint">
                            {meal.type}
                          </span>
                          <span className="truncate">{meal.name}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-auto flex items-center justify-between gap-4 pt-6">
                      <p className="font-ledger text-[11px] text-ink-faint">
                        {plan.meals.length} meals
                        {calories > 0 ? ` · ${calories} kcal` : ""} · {plan.duration} wk
                      </p>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEditDietPlan(plan)}
                          className={paperIconButton}
                          aria-label={`Edit ${plan.name}`}
                        >
                          <Edit size={15} />
                        </button>
                        <button
                          onClick={() => handleDeleteDietPlanClick(plan.id)}
                          className={`${paperIconButton} hover:text-clay`}
                          aria-label={`Delete ${plan.name}`}
                        >
                          <Trash2 size={15} />
                        </button>
                        <Link to={`/health/diet/${plan.id}`} className="paper-focus ink-link ml-2 text-sm">
                          Open
                        </Link>
                      </div>
                    </div>
                  </li>
                );
              })}
        </ul>
      )}

      {planModals}

      <ConfirmationDialog
        isOpen={deleteConfirmation.isOpen}
        onClose={() =>
          setDeleteConfirmation({ isOpen: false, planId: null, planName: "", type: "workout" })
        }
        onConfirm={handleConfirmDelete}
        title={`Delete this ${deleteConfirmation.type === "workout" ? "workout" : "meal"} plan?`}
        message={`“${deleteConfirmation.planName}” will be removed for good.`}
        confirmText="Delete"
        cancelText="Keep it"
        type="danger"
      />
    </PaperPage>
  );
};

export default Health;
