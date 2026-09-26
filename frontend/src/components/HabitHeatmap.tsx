import React, { useEffect, useMemo, useRef, useState } from "react";
import type { HabitHeatmapProps } from "@/services/types";
import {
  currentStreak,
  longestStreak,
  todayKey,
  toDateKey,
  yearColumns,
} from "@/lib/habits";
import PaperDialog, { PaperButton } from "./paper/PaperDialog";

const monthNames = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
const weekdayLabels = ["Mon", "", "Wed", "", "Fri", "", ""];

const Stat: React.FC<{ label: string; value: React.ReactNode }> = ({
  label,
  value,
}) => (
  <div>
    <dt className="font-ledger text-[10px] uppercase tracking-[0.16em] text-ink-faint">
      {label}
    </dt>
    <dd className="mt-1 font-display text-3xl leading-none tabular-nums">
      {value}
    </dd>
  </div>
);

const HabitHeatmap: React.FC<HabitHeatmapProps> = ({
  habit,
  onToggleCompletion,
  onDelete,
  isOptimistic = false,
}) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const year = new Date().getFullYear();
  const today = todayKey();

  const columns = useMemo(() => yearColumns(year), [year]);

  const monthStarts = useMemo(() => {
    const starts: { column: number; label: string }[] = [];
    columns.forEach((column, index) => {
      const firstOfMonth = column.find((cell) => cell?.date.getDate() === 1);
      if (firstOfMonth) {
        starts.push({ column: index, label: monthNames[firstOfMonth.date.getMonth()] });
      }
    });
    return starts;
  }, [columns]);

  const stats = useMemo(() => {
    const done = Object.keys(habit.completions).filter(
      (key) => habit.completions[key]
    );
    const doneThisYear = done.filter((key) => key.startsWith(`${year}-`)).length;

    // Rate is measured from Jan 1 or the day the habit was created, whichever is later.
    const created = new Date(habit.createdAt);
    const start =
      created.getFullYear() === year ? created : new Date(year, 0, 1);
    const startKey = toDateKey(start);
    const elapsed =
      Math.round(
        (new Date(`${today}T00:00:00`).getTime() -
          new Date(`${startKey}T00:00:00`).getTime()) /
          86400000
      ) + 1;
    const doneSinceStart = done.filter(
      (key) => key >= startKey && key <= today
    ).length;

    return {
      total: done.length,
      doneThisYear,
      rate: elapsed > 0 ? Math.round((doneSinceStart / elapsed) * 100) : 0,
      streak: currentStreak(habit.completions),
      best: longestStreak(habit.completions),
    };
  }, [habit.completions, habit.createdAt, year, today]);

  // On narrow screens the year overflows; start scrolled to today, not January.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || el.scrollWidth <= el.clientWidth) return;
    const todayCell = el.querySelector<HTMLElement>("[data-today]");
    if (todayCell) {
      el.scrollLeft = todayCell.offsetLeft - el.clientWidth + 48;
    }
  }, []);

  const gridTemplate = {
    gridTemplateColumns: `2rem repeat(${columns.length}, minmax(0, 1fr))`,
  };

  const confirmDelete = () => {
    onDelete(habit.id);
    setIsDeleteDialogOpen(false);
  };

  return (
    <article
      className={`border-t border-ink pt-6 transition-opacity ${
        isOptimistic ? "opacity-70" : ""
      }`}
      aria-busy={isOptimistic}
    >
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="font-display text-4xl leading-none">{habit.name}</h3>
          <p className="mt-3 font-ledger text-[11px] uppercase tracking-[0.16em] text-ink-faint">
            {isOptimistic ? "Saving…" : `${stats.total} days kept in all`}
          </p>
        </div>

        <div className="flex items-start gap-8">
          <dl className="grid grid-cols-3 gap-6 sm:gap-8">
            <Stat
              label="Streak"
              value={
                <>
                  {stats.streak}
                  <span className="ml-1 font-paper text-sm text-ink-faint">d</span>
                </>
              }
            />
            <Stat
              label="Best"
              value={
                <>
                  {stats.best}
                  <span className="ml-1 font-paper text-sm text-ink-faint">d</span>
                </>
              }
            />
            <Stat
              label={`${year} rate`}
              value={
                <>
                  {stats.rate}
                  <span className="ml-0.5 font-paper text-sm text-ink-faint">%</span>
                </>
              }
            />
          </dl>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="-mx-4 mt-8 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0"
      >
        <div className="relative min-w-[680px]">
          <div className="grid gap-[3px]" style={gridTemplate} aria-hidden="true">
            <span />
            {columns.map((_, index) => {
              const start = monthStarts.find((m) => m.column === index);
              return (
                <span
                  key={index}
                  className="h-4 overflow-visible whitespace-nowrap font-ledger text-[10px] uppercase tracking-[0.12em] text-ink-faint"
                >
                  {start?.label ?? ""}
                </span>
              );
            })}
          </div>

          <div
            className={`mt-1 grid grid-flow-col gap-[3px] ${
              isOptimistic ? "pointer-events-none" : ""
            }`}
            style={{ ...gridTemplate, gridTemplateRows: "repeat(7, auto)" }}
            role="group"
            aria-label={`${habit.name}, ${stats.doneThisYear} days kept in ${year}`}
          >
            {weekdayLabels.map((label, row) => (
              <span
                key={`label-${row}`}
                aria-hidden="true"
                className="flex items-center font-ledger text-[10px] text-ink-faint"
                style={{ gridColumn: 1, gridRow: row + 1 }}
              >
                {label}
              </span>
            ))}

            {columns.map((column, colIndex) =>
              column.map((cell, row) => {
                const position = { gridColumn: colIndex + 2, gridRow: row + 1 };
                if (!cell) {
                  return (
                    <span key={`${colIndex}-${row}`} className="aspect-square" style={position} />
                  );
                }

                const done = !!habit.completions[cell.key];
                const isToday = cell.key === today;
                const isFuture = cell.key > today;
                const label = cell.date.toLocaleDateString("en-GB", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                });

                if (isToday) {
                  return (
                    <button
                      key={cell.key}
                      data-today
                      style={position}
                      onClick={() => onToggleCompletion(habit.id, cell.key)}
                      disabled={isOptimistic}
                      aria-pressed={done}
                      aria-label={`Today, ${label}: ${done ? "done" : "not done"}`}
                      title={`Today — ${done ? "done" : "not done yet"}`}
                      className={`paper-focus aspect-square rounded-[2px] outline outline-2 outline-offset-1 outline-clay transition-colors ${
                        done ? "bg-ink" : "bg-paper hover:bg-ink/20"
                      }`}
                    />
                  );
                }

                return (
                  <span
                    key={cell.key}
                    style={position}
                    title={`${label}${isFuture ? "" : done ? " — done" : " — missed"}`}
                    className={`aspect-square rounded-[2px] ${
                      isFuture
                        ? "border border-ink/10"
                        : done
                        ? "bg-ink"
                        : "bg-ink/[0.08]"
                    }`}
                  />
                );
              })
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4 font-ledger text-[10px] uppercase tracking-[0.14em] text-ink-faint">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-[2px] bg-ink" /> Done
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-[2px] bg-ink/[0.08]" /> Missed
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-[2px] outline outline-2 outline-offset-1 outline-clay" /> Today
          </span>
        </div>
        <button
          onClick={() => setIsDeleteDialogOpen(true)}
          disabled={isOptimistic}
          className="paper-focus ink-link text-sm text-ink-faint hover:text-clay disabled:opacity-50"
        >
          Remove habit
        </button>
      </div>

      <PaperDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title={`Remove “${habit.name}”?`}
        description={`This erases all ${stats.total} days you've kept. It can't be undone.`}
      >
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <PaperButton tone="quiet" onClick={() => setIsDeleteDialogOpen(false)}>
            Keep it
          </PaperButton>
          <PaperButton tone="danger" onClick={confirmDelete}>
            Remove
          </PaperButton>
        </div>
      </PaperDialog>
    </article>
  );
};

export default HabitHeatmap;
