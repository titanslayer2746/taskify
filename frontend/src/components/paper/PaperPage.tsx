import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, RefreshCw, X } from "lucide-react";
import PaperNavbar from "./PaperNavbar";
import { PaperButton } from "./PaperDialog";
import { paperKicker, paperSheet } from "@/lib/paper";

type PaperPageProps = {
  number: string;
  title: string;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  width?: "default" | "narrow";
  kicker?: string;
  back?: { to: string; label: string };
};

// The app shell for every signed-in page: navbar, masthead, content.
const PaperPage: React.FC<PaperPageProps> = ({
  number,
  title,
  subtitle,
  actions,
  children,
  width = "default",
  kicker,
  back,
}) => (
  <div className="paper-grain min-h-screen font-paper text-ink antialiased selection:bg-clay/20">
    <PaperNavbar />
    <main
      className={`mx-auto px-4 pb-24 pt-10 sm:px-6 sm:pt-14 ${
        width === "narrow" ? "max-w-4xl" : "max-w-6xl"
      }`}
    >
      {back && (
        <Link
          to={back.to}
          className="paper-focus mb-8 inline-flex items-center gap-2 font-ledger text-[11px] uppercase tracking-[0.16em] text-ink-soft hover:text-ink"
        >
          <ArrowLeft size={14} />
          {back.label}
        </Link>
      )}
      <div className="flex flex-wrap items-end justify-between gap-6 border-b border-ink pb-6">
        <div>
          <p className={`mb-4 ${paperKicker}`}>
            {kicker ?? `${number} — ${title}`}
          </p>
          <h1 className="font-display text-6xl leading-[0.9] tracking-[-0.02em] sm:text-7xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-3 font-display text-2xl italic text-ink-soft">
              {subtitle}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex flex-wrap items-center gap-3">{actions}</div>
        )}
      </div>
      {children}
    </main>
  </div>
);

export const SectionHeading: React.FC<{
  kicker?: string;
  title: React.ReactNode;
  aside?: React.ReactNode;
  id?: string;
}> = ({ kicker, title, aside, id }) => (
  <div className="flex flex-wrap items-end justify-between gap-4">
    <div>
      {kicker && <p className={`mb-3 ${paperKicker}`}>{kicker}</p>}
      <h2
        id={id}
        className="font-display text-4xl leading-[1.02] tracking-[-0.01em] sm:text-5xl"
      >
        {title}
      </h2>
    </div>
    {aside}
  </div>
);

export const PaperLoading: React.FC<{ label: string }> = ({ label }) => (
  <div className="py-24 text-center" role="status">
    <p className="animate-pulse font-display text-3xl italic text-ink-soft">
      {label}
    </p>
  </div>
);

export const PaperErrorState: React.FC<{
  message: string;
  onRetry?: () => void;
}> = ({ message, onRetry }) => (
  <div className="mx-auto max-w-lg py-24 text-center" role="alert">
    <p className="font-display text-3xl italic">We couldn't open this page.</p>
    <p className="mt-3 text-ink-soft">{message}</p>
    {onRetry && (
      <PaperButton onClick={onRetry} className="mt-8">
        <RefreshCw size={16} />
        Try again
      </PaperButton>
    )}
  </div>
);

export const PaperBanner: React.FC<{
  message: string;
  onDismiss?: () => void;
  tone?: "error" | "note";
}> = ({ message, onDismiss, tone = "error" }) => (
  <div
    role={tone === "error" ? "alert" : "status"}
    className={`mt-6 flex items-start justify-between gap-4 border-l-2 px-4 py-3 text-[15px] ${
      tone === "error"
        ? "border-clay bg-clay/10 text-[#8A4526]"
        : "border-ink bg-paper-deep/70 text-ink"
    }`}
  >
    <span>{message}</span>
    {onDismiss && (
      <button
        onClick={onDismiss}
        aria-label="Dismiss"
        className="paper-focus shrink-0 p-0.5 hover:text-ink"
      >
        <X size={16} />
      </button>
    )}
  </div>
);

export const PaperEmpty: React.FC<{
  title: string;
  body: string;
  action?: React.ReactNode;
}> = ({ title, body, action }) => (
  <div className="mx-auto mt-16 max-w-xl">
    <div className={`relative ${paperSheet}`}>
      <div className="absolute bottom-0 left-10 top-0 w-px bg-clay/40" />
      <div className="paper-ruled relative px-8 pb-10 pl-16 pt-8">
        <p className="font-display text-4xl italic leading-tight">{title}</p>
        <p className="mt-4 leading-8 text-ink-soft">{body}</p>
        {action && <div className="mt-8">{action}</div>}
      </div>
    </div>
  </div>
);

export const PaperStat: React.FC<{
  label: string;
  value: React.ReactNode;
  unit?: string;
  note?: React.ReactNode;
}> = ({ label, value, unit, note }) => (
  <div>
    <dt className="font-ledger text-[10px] uppercase tracking-[0.16em] text-ink-faint">
      {label}
    </dt>
    <dd className="mt-2 font-display text-4xl leading-none tabular-nums">
      {value}
      {unit && (
        <span className="ml-1 font-paper text-sm text-ink-faint">{unit}</span>
      )}
    </dd>
    {note && <dd className="mt-2 text-sm text-ink-soft">{note}</dd>}
  </div>
);

export default PaperPage;
