import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import type { CreateHabitModalProps } from "@/services/types";
import PaperDialog, { PaperButton } from "./paper/PaperDialog";

const suggestions = ["Read 20 pages", "Walk after lunch", "No phone in bed"];

const CreateHabitModal: React.FC<CreateHabitModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}) => {
  const [habitName, setHabitName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (habitName.trim() && !isLoading) {
      onConfirm(habitName.trim());
      setHabitName("");
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setHabitName("");
      onClose();
    }
  };

  return (
    <PaperDialog
      open={isOpen}
      onOpenChange={(open) => !open && handleClose()}
      title="A new habit"
      description="Something small you'd like to do every day."
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="habitName"
            className="font-ledger text-[11px] uppercase tracking-[0.16em] text-ink-soft"
          >
            Name
          </label>
          <input
            id="habitName"
            type="text"
            value={habitName}
            onChange={(e) => setHabitName(e.target.value)}
            placeholder="e.g. Read before bed"
            className="w-full border-0 border-b border-ink/30 bg-transparent px-0 py-2.5 text-lg text-ink placeholder:text-ink-faint/70 transition-colors duration-200 focus:border-ink focus:outline-none focus:ring-0 disabled:opacity-60"
            maxLength={50}
            autoFocus
            disabled={isLoading}
          />
          <div className="mt-3 flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setHabitName(s)}
                disabled={isLoading}
                className="paper-focus rounded-full border border-ink/20 px-3 py-1 text-sm text-ink-soft transition-colors hover:border-ink hover:text-ink"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <PaperButton
            type="button"
            tone="quiet"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </PaperButton>
          <PaperButton type="submit" disabled={!habitName.trim() || isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Adding…
              </>
            ) : (
              "Add habit"
            )}
          </PaperButton>
        </div>
      </form>
    </PaperDialog>
  );
};

export default CreateHabitModal;
