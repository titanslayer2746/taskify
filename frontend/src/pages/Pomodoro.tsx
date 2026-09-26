import React, { useState } from "react";
import PomodoroTimer from "../components/PomodoroTimer";
import PomodoroSettings from "../components/PomodoroSettings";
import PaperPage from "../components/paper/PaperPage";
import { PaperButton } from "../components/paper/PaperDialog";
import { Settings } from "lucide-react";
import type { PomodoroSettingsData } from "@/services/types";
import { paperKicker, paperSheet } from "@/lib/paper";

const Pomodoro = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<PomodoroSettingsData>({
    workTime: 25,
    breakTime: 5,
    longBreakTime: 15,
    longBreakInterval: 4,
  });

  const rows = [
    { label: "Focus", value: `${settings.workTime} min` },
    { label: "Short break", value: `${settings.breakTime} min` },
    { label: "Long break", value: `${settings.longBreakTime} min` },
    { label: "Long break every", value: `${settings.longBreakInterval} sessions` },
  ];

  return (
    <PaperPage
      number="02"
      title="Focus"
      subtitle="One thing at a time."
      actions={
        <PaperButton tone="quiet" onClick={() => setIsSettingsOpen(true)}>
          <Settings size={16} />
          Timer lengths
        </PaperButton>
      }
    >
      <div className="mt-12 grid gap-16 lg:grid-cols-12 lg:gap-10">
        <section aria-label="Timer" className={`lg:col-span-8 ${paperSheet} px-6 py-12 sm:px-10`}>
          <PomodoroTimer settings={settings} />
        </section>

        <aside className="lg:col-span-4">
          <p className={paperKicker}>The method</p>
          <p className="mt-4 font-display text-3xl leading-tight">
            Work in short, protected stretches.
          </p>
          <p className="mt-4 leading-relaxed text-ink-soft">
            Pick one task, start the timer and don't switch until it rings.
            Take the short break for real. After a full set, step away for
            longer.
          </p>

          <dl className="mt-10 border-t border-ink font-ledger text-[13px]">
            {rows.map((row) => (
              <div
                key={row.label}
                className="flex items-baseline justify-between border-b border-paper-rule py-2.5"
              >
                <dt className="text-ink-soft">{row.label}</dt>
                <dd className="tabular-nums">{row.value}</dd>
              </div>
            ))}
          </dl>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="paper-focus ink-link mt-4 text-sm text-ink-soft hover:text-ink"
          >
            Change lengths
          </button>
        </aside>
      </div>

      <PomodoroSettings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSettingsChange={setSettings}
      />
    </PaperPage>
  );
};

export default Pomodoro;
