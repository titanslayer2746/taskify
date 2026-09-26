import React, { useState } from "react";
import { Trash2 } from "lucide-react";
import type { JournalCardProps } from "@/services/types";
import ConfirmationDialog from "./ConfirmationDialog";
import { paperIconButton } from "@/lib/paper";

// One entry in the journal's index: date, title, a first line, tags.
const JournalCard: React.FC<JournalCardProps> = ({
  entry,
  onDelete,
  onView,
  isOptimistic = false,
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const created = new Date(entry.createdAt);
  const title = entry.title || "Untitled";
  const words = entry.content.split(/\s+/).filter(Boolean).length;

  return (
    <li
      className={`group grid grid-cols-[3.5rem_1fr_auto] gap-x-5 border-b border-paper-rule py-6 transition-opacity sm:grid-cols-[4.5rem_1fr_auto] ${
        isOptimistic ? "opacity-60" : ""
      }`}
    >
      <p className="pt-1 text-center">
        <span className="block font-display text-4xl leading-none">
          {created.getDate()}
        </span>
        <span className="mt-1 block font-ledger text-[10px] uppercase tracking-[0.14em] text-ink-faint">
          {created.toLocaleDateString("en-GB", { weekday: "short" })}
        </span>
      </p>

      <div className="min-w-0">
        <h3 className="font-display text-2xl leading-tight sm:text-3xl">
          <button
            onClick={onView}
            className="paper-focus text-left transition-colors hover:text-clay"
          >
            {title}
          </button>
        </h3>
        {entry.content ? (
          <p className="mt-2 line-clamp-2 max-w-2xl leading-relaxed text-ink-soft">
            {entry.content}
          </p>
        ) : (
          <p className="mt-2 font-display text-lg italic text-ink-faint">
            A blank page.
          </p>
        )}
        <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 font-ledger text-[11px] text-ink-faint">
          <span>
            {created.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
          </span>
          <span>{words} {words === 1 ? "word" : "words"}</span>
          {entry.tags?.map((tag) => (
            <span key={tag}>#{tag}</span>
          ))}
          {isOptimistic && <span>saving…</span>}
        </p>
      </div>

      <button
        onClick={() => setShowDeleteConfirm(true)}
        disabled={isOptimistic}
        aria-label={`Delete “${title}”`}
        className={`${paperIconButton} self-start hover:text-clay sm:opacity-0 sm:focus-visible:opacity-100 sm:group-hover:opacity-100`}
      >
        <Trash2 size={15} />
      </button>

      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => onDelete(entry.id)}
        title="Tear out this page?"
        message={`“${title}” and everything written in it will be deleted for good.`}
        confirmText="Delete"
        cancelText="Keep it"
      />
    </li>
  );
};

export default JournalCard;
