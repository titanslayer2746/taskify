import React, { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { FinanceDashboardProps } from "@/services/types";
import { toDateKey } from "@/lib/habits";
import { EXPENSE_INK, INCOME_INK, formatINR, paperKicker } from "@/lib/paper";

type Period = "week" | "month" | "year";

const periodLabels: Record<Period, string> = {
  week: "7 days",
  month: "30 days",
  year: "12 months",
};

const compactINR = (value: number) =>
  `₹${new Intl.NumberFormat("en-IN", { notation: "compact" }).format(value)}`;

type Row = { key: string; label: string; income: number; expenses: number };

const ChartTooltip: React.FC<{
  active?: boolean;
  payload?: { payload: Row }[];
}> = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
  return (
    <div className="rounded-[3px] border border-ink/15 bg-[#F9F7EF] px-3 py-2 font-paper text-sm text-ink shadow-[0_12px_24px_-16px_rgba(20,45,30,0.5)]">
      <p className="font-ledger text-[11px] uppercase tracking-[0.12em] text-ink-faint">
        {row.label}
      </p>
      <p className="mt-1 flex items-center gap-2 tabular-nums">
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: INCOME_INK }} />
        In {formatINR(row.income)}
      </p>
      <p className="flex items-center gap-2 tabular-nums">
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: EXPENSE_INK }} />
        Out {formatINR(row.expenses)}
      </p>
    </div>
  );
};

// Income against spending, bucketed by day, week or month.
const FinanceDashboard: React.FC<FinanceDashboardProps> = ({ entries }) => {
  const [period, setPeriod] = useState<Period>("year");
  const [asTable, setAsTable] = useState(false);

  const analytics = useMemo(() => {
    const now = new Date();
    const days = period === "week" ? 7 : period === "month" ? 30 : 365;
    const start = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    const inRange = entries.filter((entry) => {
      const d = new Date(entry.date);
      return d >= start && d <= now;
    });

    const buckets: Record<string, Row> = {};
    for (const entry of inRange) {
      const d = new Date(entry.date);
      let key: string;
      let label: string;
      if (period === "week") {
        key = toDateKey(d);
        label = d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric" });
      } else if (period === "month") {
        const weekStart = new Date(d);
        weekStart.setDate(d.getDate() - d.getDay());
        key = toDateKey(weekStart);
        label = `w/c ${weekStart.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`;
      } else {
        key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        label = `${d.toLocaleDateString("en-GB", { month: "short" })} ’${String(d.getFullYear()).slice(2)}`;
      }
      buckets[key] ??= { key, label, income: 0, expenses: 0 };
      if (entry.type === "income") buckets[key].income += entry.amount;
      else buckets[key].expenses += entry.amount;
    }

    return {
      totalIncome: inRange
        .filter((e) => e.type === "income")
        .reduce((sum, e) => sum + e.amount, 0),
      totalExpenses: inRange
        .filter((e) => e.type === "expense")
        .reduce((sum, e) => sum + e.amount, 0),
      rows: Object.values(buckets).sort((a, b) => a.key.localeCompare(b.key)),
    };
  }, [entries, period]);

  return (
    <section aria-labelledby="trend-heading" className="mt-20">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className={`mb-3 ${paperKicker}`}>The trend</p>
          <h2
            id="trend-heading"
            className="font-display text-4xl leading-[1.02] tracking-[-0.01em] sm:text-5xl"
          >
            In and out, <span className="italic">over time.</span>
          </h2>
        </div>
        <div className="flex items-center gap-6">
          <div role="tablist" aria-label="Period" className="flex gap-5">
            {(Object.keys(periodLabels) as Period[]).map((p) => (
              <button
                key={p}
                role="tab"
                aria-selected={period === p}
                onClick={() => setPeriod(p)}
                className={`paper-focus relative pb-1 text-[15px] ${
                  period === p
                    ? "text-ink after:absolute after:inset-x-0 after:-bottom-px after:h-[2px] after:bg-clay"
                    : "text-ink-soft hover:text-ink"
                }`}
              >
                {periodLabels[p]}
              </button>
            ))}
          </div>
          <button
            onClick={() => setAsTable((t) => !t)}
            className="paper-focus ink-link text-sm text-ink-soft hover:text-ink"
          >
            {asTable ? "Show chart" : "Show table"}
          </button>
        </div>
      </div>

      <div className="mt-8 border-t border-ink pt-6">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-2 text-sm">
          <span className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-[2px]" style={{ backgroundColor: INCOME_INK }} />
            Money in
            <span className="font-ledger tabular-nums text-ink-soft">
              {formatINR(analytics.totalIncome)}
            </span>
          </span>
          <span className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-[2px]" style={{ backgroundColor: EXPENSE_INK }} />
            Money out
            <span className="font-ledger tabular-nums text-ink-soft">
              {formatINR(analytics.totalExpenses)}
            </span>
          </span>
        </div>

        {analytics.rows.length === 0 ? (
          <p className="py-16 text-center font-display text-2xl italic text-ink-faint">
            Nothing logged in the last {periodLabels[period]}.
          </p>
        ) : asTable ? (
          <table className="mt-6 w-full font-ledger text-[13px]">
            <thead>
              <tr className="border-b border-ink text-left text-[10px] uppercase tracking-[0.14em] text-ink-faint">
                <th className="py-2 font-normal">Period</th>
                <th className="py-2 text-right font-normal">In</th>
                <th className="py-2 text-right font-normal">Out</th>
                <th className="py-2 text-right font-normal">Net</th>
              </tr>
            </thead>
            <tbody>
              {analytics.rows.map((row) => (
                <tr key={row.key} className="border-b border-paper-rule">
                  <td className="py-2">{row.label}</td>
                  <td className="py-2 text-right tabular-nums">{formatINR(row.income)}</td>
                  <td className="py-2 text-right tabular-nums">{formatINR(row.expenses)}</td>
                  <td className="py-2 text-right tabular-nums">
                    {formatINR(row.income - row.expenses)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="mt-6 h-64 w-full sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={analytics.rows}
                margin={{ top: 8, right: 0, left: 0, bottom: 0 }}
                barGap={2}
                barCategoryGap="28%"
              >
                <CartesianGrid vertical={false} stroke="#D3CDB7" strokeDasharray="0" />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={{ stroke: "#1F3326" }}
                  tick={{ fill: "#52614F", fontSize: 11, fontFamily: "Geist Mono" }}
                  interval="preserveStartEnd"
                  minTickGap={12}
                />
                <YAxis
                  tickFormatter={compactINR}
                  tickLine={false}
                  axisLine={false}
                  width={56}
                  tick={{ fill: "#86907F", fontSize: 11, fontFamily: "Geist Mono" }}
                />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(31,51,38,0.05)" }} />
                <Bar dataKey="income" name="Money in" fill={INCOME_INK} radius={[4, 4, 0, 0]} maxBarSize={28} isAnimationActive={false} />
                <Bar dataKey="expenses" name="Money out" fill={EXPENSE_INK} radius={[4, 4, 0, 0]} maxBarSize={28} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </section>
  );
};

export default FinanceDashboard;
