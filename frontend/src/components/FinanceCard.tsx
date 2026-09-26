import React from "react";
import { Copy, Trash2 } from "lucide-react";
import type { FinanceCardProps } from "@/services/types";
import {
  EXPENSE_INK,
  INCOME_INK,
  formatINR,
  paperIconButton,
} from "@/lib/paper";

// One line of the ledger.
const FinanceCard: React.FC<FinanceCardProps> = ({ entry, onDelete, onCopy }) => {
  const date = new Date(entry.date);
  const income = entry.type === "income";

  return (
    <li className="group grid grid-cols-[3.5rem_1fr_auto] items-start gap-x-4 border-b border-paper-rule py-4 sm:grid-cols-[4.5rem_1fr_auto_auto]">
      <div className="pt-1 font-ledger text-[11px] uppercase leading-tight tracking-[0.1em] text-ink-faint">
        <span className="block text-base tabular-nums text-ink">
          {date.toLocaleDateString("en-IN", { day: "2-digit" })}
        </span>
        {date.toLocaleDateString("en-IN", { month: "short" })}
        <span className="hidden sm:inline">
          {" "}
          {date.getFullYear() !== new Date().getFullYear() ? date.getFullYear() : ""}
        </span>
      </div>

      <div className="min-w-0">
        <p className="text-lg leading-snug">{entry.title}</p>
        <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-soft">
          <span className="flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: income ? INCOME_INK : EXPENSE_INK }}
            />
            {entry.category}
          </span>
          {entry.tags.map((tag) => (
            <span key={tag} className="font-ledger text-[11px] text-ink-faint">
              #{tag}
            </span>
          ))}
        </p>
        {entry.description && (
          <p className="mt-1 line-clamp-2 text-sm text-ink-faint">
            {entry.description}
          </p>
        )}
      </div>

      <p className="pt-0.5 text-right font-ledger text-lg tabular-nums">
        <span className="sr-only">{income ? "Income" : "Expense"}: </span>
        {income ? "+" : "−"}
        {formatINR(entry.amount)}
      </p>

      <div className="col-start-3 flex justify-end gap-1 sm:col-start-auto sm:opacity-0 sm:transition-opacity sm:focus-within:opacity-100 sm:group-hover:opacity-100">
        <button
          onClick={() => onCopy(entry)}
          className={paperIconButton}
          aria-label={`Log “${entry.title}” again`}
          title="Log again"
        >
          <Copy size={15} />
        </button>
        <button
          onClick={() => onDelete(entry.id)}
          className={`${paperIconButton} hover:text-clay`}
          aria-label={`Delete “${entry.title}”`}
          title="Delete"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </li>
  );
};

export default FinanceCard;
