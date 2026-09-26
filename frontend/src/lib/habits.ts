// Habit date helpers. Dates are local calendar days as "YYYY-MM-DD" so that
// "today" matches the user's wall clock rather than UTC.

export const toDateKey = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export const todayKey = (): string => toDateKey(new Date());

const addDays = (date: Date, days: number): Date => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

// Consecutive completed days ending today. If today isn't ticked yet, the
// streak still counts through yesterday so it doesn't read 0 every morning.
export const currentStreak = (completions: Record<string, boolean>): number => {
  let cursor = new Date();
  if (!completions[toDateKey(cursor)]) cursor = addDays(cursor, -1);

  let streak = 0;
  while (completions[toDateKey(cursor)]) {
    streak++;
    cursor = addDays(cursor, -1);
  }
  return streak;
};

export const longestStreak = (completions: Record<string, boolean>): number => {
  const days = Object.keys(completions)
    .filter((key) => completions[key])
    .sort();

  let best = 0;
  let run = 0;
  let previous: Date | null = null;
  for (const key of days) {
    const [y, m, d] = key.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    run =
      previous && toDateKey(addDays(previous, 1)) === key ? run + 1 : 1;
    best = Math.max(best, run);
    previous = date;
  }
  return best;
};

// The last seven days, oldest first, ending today.
export const lastSevenDays = (): string[] =>
  Array.from({ length: 7 }, (_, i) => toDateKey(addDays(new Date(), i - 6)));

export type YearCell = { key: string; date: Date } | null;

// Columns of seven cells (Mon..Sun) covering the whole of `year`. Cells that
// fall outside the year are null so the grid keeps its weekday rows.
export const yearColumns = (year: number): YearCell[][] => {
  const first = new Date(year, 0, 1);
  const last = new Date(year, 11, 31);
  const mondayOffset = (first.getDay() + 6) % 7;
  let cursor = addDays(first, -mondayOffset);

  const columns: YearCell[][] = [];
  while (cursor <= last) {
    const column: YearCell[] = [];
    for (let i = 0; i < 7; i++) {
      column.push(
        cursor.getFullYear() === year
          ? { key: toDateKey(cursor), date: new Date(cursor) }
          : null
      );
      cursor = addDays(cursor, 1);
    }
    columns.push(column);
  }
  return columns;
};
