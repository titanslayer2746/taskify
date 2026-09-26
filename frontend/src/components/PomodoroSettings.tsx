import React, { useEffect, useState } from "react";
import type {
  PomodoroSettingsData,
  PomodoroSettingsProps,
} from "@/services/types";
import PaperDialog, { PaperButton } from "./paper/PaperDialog";
import { paperInput, paperLabel } from "@/lib/paper";

const fields: {
  key: keyof PomodoroSettingsData;
  label: string;
  hint: string;
  unit: string;
  min: number;
  max: number;
  fallback: number;
}[] = [
  { key: "workTime", label: "Focus", hint: "Length of each focus session", unit: "min", min: 1, max: 60, fallback: 25 },
  { key: "breakTime", label: "Short break", hint: "Between focus sessions", unit: "min", min: 1, max: 30, fallback: 5 },
  { key: "longBreakTime", label: "Long break", hint: "After a full set", unit: "min", min: 1, max: 60, fallback: 15 },
  { key: "longBreakInterval", label: "Set length", hint: "Focus sessions before a long break", unit: "sessions", min: 1, max: 10, fallback: 4 },
];

const PomodoroSettings: React.FC<PomodoroSettingsProps> = ({
  isOpen,
  onClose,
  settings,
  onSettingsChange,
}) => {
  const [localSettings, setLocalSettings] = useState(settings);

  useEffect(() => {
    if (isOpen) setLocalSettings(settings);
  }, [isOpen, settings]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSettingsChange(localSettings);
    onClose();
  };

  return (
    <PaperDialog
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      title="Timer lengths"
    >
      <form onSubmit={handleSave} className="space-y-6">
        {fields.map((field) => (
          <div key={field.key} className="flex items-end justify-between gap-6">
            <label htmlFor={`pomo-${field.key}`} className="flex-1">
              <span className={paperLabel}>{field.label}</span>
              <span className="mt-1 block text-sm text-ink-faint">
                {field.hint}
              </span>
            </label>
            <div className="flex w-28 items-baseline gap-2">
              <input
                id={`pomo-${field.key}`}
                type="number"
                min={field.min}
                max={field.max}
                value={localSettings[field.key]}
                onChange={(e) =>
                  setLocalSettings({
                    ...localSettings,
                    [field.key]: parseInt(e.target.value) || field.fallback,
                  })
                }
                className={`${paperInput} text-right font-ledger text-lg tabular-nums`}
              />
              <span className="w-14 shrink-0 font-ledger text-[11px] text-ink-faint">
                {field.unit}
              </span>
            </div>
          </div>
        ))}

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <PaperButton type="button" tone="quiet" onClick={onClose}>
            Cancel
          </PaperButton>
          <PaperButton type="submit">Save</PaperButton>
        </div>
      </form>
    </PaperDialog>
  );
};

export default PomodoroSettings;
