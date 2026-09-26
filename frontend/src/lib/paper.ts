// Shared class strings for the Paper & Ink design. Kept outside component
// files so they can be imported anywhere without breaking fast refresh.

export const paperLabel =
  "font-ledger text-[11px] uppercase tracking-[0.16em] text-ink-soft";

export const paperKicker =
  "font-ledger text-[11px] uppercase tracking-[0.18em] text-ink-soft";

// Underlined "written on a line" field.
export const paperInput =
  "w-full border-0 border-b border-ink/30 bg-transparent px-0 py-2 text-ink placeholder:text-ink-faint/70 transition-colors duration-200 focus:border-ink focus:outline-none focus:ring-0 disabled:opacity-60";

export const paperTextarea =
  "w-full rounded-[3px] border border-ink/20 bg-[#F9F7EF] px-3 py-2.5 leading-relaxed text-ink placeholder:text-ink-faint/70 transition-colors duration-200 focus:border-ink focus:outline-none focus:ring-0 disabled:opacity-60";

export const paperSelect =
  "w-full cursor-pointer border-0 border-b border-ink/30 bg-transparent py-2 pl-0 pr-7 text-ink transition-colors duration-200 focus:border-ink focus:outline-none focus:ring-0 disabled:opacity-60";

// A sheet of paper lying on the desk.
export const paperSheet =
  "rounded-[3px] bg-[#F9F7EF] shadow-[0_1px_0_#d3cdb7,0_24px_48px_-28px_rgba(20,45,30,0.35)]";

export const paperChip =
  "inline-flex items-center gap-1.5 rounded-full border border-ink/20 px-2.5 py-0.5 font-ledger text-[10px] uppercase tracking-[0.12em] text-ink-soft";

export const paperIconButton =
  "paper-focus inline-grid place-items-center rounded-sm p-1.5 text-ink-faint transition-colors duration-200 hover:bg-ink/5 hover:text-ink disabled:opacity-50";

export const paperErrorText = "mt-2 text-sm text-[#8A4526]";

export const todayDateline = () =>
  new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

// Finance: income and spending inks, checked for colour-blind separation on paper.
export const INCOME_INK = "#3A6EA5";
export const EXPENSE_INK = "#B8643C";

export const formatINR = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
