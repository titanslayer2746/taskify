import React, { useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw, SkipForward } from "lucide-react";
import type { PomodoroTimerProps } from "@/services/types";
import { PaperButton } from "./paper/PaperDialog";

type Mode = "work" | "break" | "longBreak";

const modeLabels: Record<Mode, string> = {
  work: "Focus",
  break: "Short break",
  longBreak: "Long break",
};

const modeSetting = {
  work: "workTime",
  break: "breakTime",
  longBreak: "longBreakTime",
} as const;

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
};

const PomodoroTimer: React.FC<PomodoroTimerProps> = ({ settings }) => {
  const [timeLeft, setTimeLeft] = useState(settings.workTime * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<Mode>("work");
  const [cycles, setCycles] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const total = settings[modeSetting[mode]] * 60;
  const progress = total > 0 ? (total - timeLeft) / total : 0;
  const untouched = !isRunning && timeLeft === total;

  // Pick up new lengths from settings while the current session hasn't started.
  const previousTotal = useRef(total);
  useEffect(() => {
    if (!isRunning && timeLeft === previousTotal.current) {
      setTimeLeft(total);
    }
    previousTotal.current = total;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total]);

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(settings.workTime * 60);
    setMode("work");
    setCycles(0);
  };

  const skipTimer = () => {
    if (mode === "work") {
      if ((cycles + 1) % settings.longBreakInterval === 0) {
        setMode("longBreak");
        setTimeLeft(settings.longBreakTime * 60);
      } else {
        setMode("break");
        setTimeLeft(settings.breakTime * 60);
      }
      setCycles(cycles + 1);
    } else {
      setMode("work");
      setTimeLeft(settings.workTime * 60);
    }
  };

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (mode === "work") {
              if ((cycles + 1) % settings.longBreakInterval === 0) {
                setMode("longBreak");
                return settings.longBreakTime * 60;
              }
              setMode("break");
              return settings.breakTime * 60;
            }
            setMode("work");
            setCycles(cycles + 1);
            return settings.workTime * 60;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, timeLeft, mode, cycles, settings]);

  // Show the countdown in the browser tab while it runs.
  useEffect(() => {
    const original = document.title;
    if (isRunning) document.title = `${formatTime(timeLeft)} · ${modeLabels[mode]}`;
    return () => {
      document.title = original;
    };
  }, [isRunning, timeLeft, mode]);

  const r = 140;
  const circumference = 2 * Math.PI * r;
  const ticks = 60;
  const sessionInSet = cycles % settings.longBreakInterval;

  return (
    <div className="flex flex-col items-center">
      <ol className="flex gap-6" aria-label="Session type">
        {(Object.keys(modeLabels) as Mode[]).map((m) => (
          <li
            key={m}
            aria-current={mode === m ? "step" : undefined}
            className={`relative pb-1 text-[15px] ${
              mode === m
                ? "text-ink after:absolute after:inset-x-0 after:-bottom-px after:h-[2px] after:bg-clay"
                : "text-ink-faint"
            }`}
          >
            {modeLabels[m]}
          </li>
        ))}
      </ol>

      <div className="relative mt-10 aspect-square w-full max-w-[340px]">
        <svg viewBox="0 0 320 320" className="h-full w-full" aria-hidden="true">
          <circle cx="160" cy="160" r={r} fill="none" stroke="#D3CDB7" strokeWidth="1" />
          {Array.from({ length: ticks }).map((_, i) => {
            const a = (i / ticks) * Math.PI * 2 - Math.PI / 2;
            const major = i % 5 === 0;
            return (
              <line
                key={i}
                x1={160 + Math.cos(a) * 150}
                y1={160 + Math.sin(a) * 150}
                x2={160 + Math.cos(a) * (major ? 158 : 154)}
                y2={160 + Math.sin(a) * (major ? 158 : 154)}
                stroke="#1F3326"
                strokeOpacity={major ? 0.9 : 0.35}
                strokeWidth={major ? 1.4 : 0.8}
              />
            );
          })}
          <circle
            cx="160"
            cy="160"
            r={r}
            fill="none"
            stroke={mode === "work" ? "#B8643C" : "#1F3326"}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={`${circumference * progress} ${circumference}`}
            transform="rotate(-90 160 160)"
            className="transition-[stroke-dasharray] duration-1000 ease-linear"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="font-ledger text-6xl tabular-nums tracking-tight sm:text-7xl"
            role="timer"
            aria-live="off"
          >
            {formatTime(timeLeft)}
          </span>
          <span className="mt-3 font-ledger text-[11px] uppercase tracking-[0.18em] text-ink-faint">
            {modeLabels[mode]} · {Math.floor(progress * 100)}%
          </span>
        </div>
      </div>

      <div className="mt-10 flex items-center gap-3">
        <PaperButton tone="quiet" onClick={resetTimer} aria-label="Reset timer">
          <RotateCcw size={16} />
          <span className="hidden sm:inline">Reset</span>
        </PaperButton>
        <PaperButton
          onClick={() => setIsRunning((running) => !running)}
          className="min-w-[9rem] py-3 text-base"
        >
          {isRunning ? <Pause size={18} /> : <Play size={18} />}
          {isRunning ? "Pause" : untouched ? "Start" : "Resume"}
        </PaperButton>
        <PaperButton
          tone="quiet"
          onClick={skipTimer}
          aria-label={`Skip to ${mode === "work" ? "break" : "focus"}`}
        >
          <SkipForward size={16} />
          <span className="hidden sm:inline">Skip</span>
        </PaperButton>
      </div>

      <div className="mt-10 flex items-center gap-3" aria-label="Sessions">
        <span className="flex gap-1.5">
          {Array.from({ length: settings.longBreakInterval }).map((_, i) => (
            <span
              key={i}
              className={`h-3 w-3 rounded-full border border-clay ${
                i < sessionInSet ? "bg-clay" : ""
              }`}
            />
          ))}
        </span>
        <span className="font-ledger text-[11px] uppercase tracking-[0.14em] text-ink-faint">
          {cycles} {cycles === 1 ? "session" : "sessions"} done
        </span>
      </div>
    </div>
  );
};

export default PomodoroTimer;
