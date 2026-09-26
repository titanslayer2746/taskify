import React from "react";
import type { FinanceStatsProps } from "@/services/types";
import { EXPENSE_INK, INCOME_INK, formatINR } from "@/lib/paper";

const FinanceStats: React.FC<FinanceStatsProps> = ({
  balance,
  totalIncome,
  totalExpenses,
}) => {
  const spentShare =
    totalIncome > 0 ? Math.min(100, (totalExpenses / totalIncome) * 100) : 0;

  return (
    <section aria-label="Totals" className="mt-12 grid gap-10 lg:grid-cols-12">
      <div className="lg:col-span-5">
        <p className="font-ledger text-[11px] uppercase tracking-[0.18em] text-ink-soft">
          Balance · all time
        </p>
        <p className="mt-3 font-display text-6xl leading-none tabular-nums sm:text-7xl">
          {balance < 0 ? "−" : ""}
          {formatINR(Math.abs(balance))}
        </p>
        <p className="mt-3 font-display text-xl italic text-ink-soft">
          {balance > 0
            ? "More in than out."
            : balance < 0
            ? "More out than in."
            : "Exactly even."}
        </p>
      </div>

      <dl className="grid grid-cols-2 gap-8 border-t border-ink pt-6 lg:col-span-7 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
        {[
          { label: "Money in", value: totalIncome, ink: INCOME_INK, sign: "+" },
          { label: "Money out", value: totalExpenses, ink: EXPENSE_INK, sign: "−" },
        ].map((row) => (
          <div key={row.label}>
            <dt className="flex items-center gap-2 font-ledger text-[11px] uppercase tracking-[0.16em] text-ink-soft">
              <span
                aria-hidden="true"
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: row.ink }}
              />
              {row.label}
            </dt>
            <dd className="mt-3 font-display text-4xl leading-none tabular-nums sm:text-5xl">
              {row.sign}
              {formatINR(row.value)}
            </dd>
          </div>
        ))}
        {totalIncome > 0 && (
          <div className="col-span-2">
            <div className="flex h-[6px] overflow-hidden bg-ink/10" aria-hidden="true">
              <span style={{ width: `${spentShare}%`, backgroundColor: EXPENSE_INK }} />
            </div>
            <p className="mt-2 font-ledger text-[11px] text-ink-faint">
              {Math.round((totalExpenses / totalIncome) * 100)}% of income spent
            </p>
          </div>
        )}
      </dl>
    </section>
  );
};

export default FinanceStats;
