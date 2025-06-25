import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Settings, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PomodoroTimerProps {
  isOpen: boolean;
  onClose: () => void;
  settings: {
    workTime: number;
    breakTime: number;
    longBreakTime: number;
    longBreakInterval: number;
  };
  onSettingsChange: (settings: {
    workTime: number;
    breakTime: number;
    longBreakTime: number;
    longBreakInterval: number;
  }) => void;
}

const PomodoroTimer: React.FC<PomodoroTimerProps> = ({
  isOpen,
  onClose,
  settings,
  onSettingsChange,
}) => {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<"work" | "break" | "longBreak">("work");
  const [cycles, setCycles] = useState(0);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const getModeColor = () => {
    switch (mode) {
      case "work":
        return "from-red-500 to-pink-500";
      case "break":
        return "from-green-500 to-emerald-500";
      case "longBreak":
        return "from-blue-500 to-cyan-500";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  const getModeIcon = () => {
    switch (mode) {
      case "work":
        return "🔥";
      case "break":
        return "☕";
      case "longBreak":
        return "🌟";
      default:
        return "⏰";
    }
  };

  const getModeLabel = () => {
    switch (mode) {
      case "work":
        return "Focus Time";
      case "break":
        return "Short Break";
      case "longBreak":
        return "Long Break";
      default:
        return "Timer";
    }
  };

  const startTimer = () => {
    setIsRunning(true);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

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
            // Timer finished
            if (mode === "work") {
              if ((cycles + 1) % settings.longBreakInterval === 0) {
                setMode("longBreak");
                return settings.longBreakTime * 60;
              } else {
                setMode("break");
                return settings.breakTime * 60;
              }
            } else {
              setMode("work");
              setCycles(cycles + 1);
              return settings.workTime * 60;
            }
          }
          return prev - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft, mode, cycles, settings]);

  const progress =
    (settings[
      mode === "work"
        ? "workTime"
        : mode === "break"
        ? "breakTime"
        : "longBreakTime"
    ] *
      60 -
      timeLeft) /
    (settings[
      mode === "work"
        ? "workTime"
        : mode === "break"
        ? "breakTime"
        : "longBreakTime"
    ] *
      60);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 mx-4 w-full max-w-sm sm:max-w-md lg:max-w-lg shadow-2xl border border-gray-700/50"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-cyan-900/20 rounded-2xl sm:rounded-3xl"></div>

        <div className="relative">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-white">
              Pomodoro Timer
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all duration-200"
            >
              <X size={18} className="sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Timer Display */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="mb-3 sm:mb-4">
              <div className="text-2xl sm:text-3xl lg:text-4xl mb-1 sm:mb-2">
                {getModeIcon()}
              </div>
              <h3 className="text-base sm:text-lg font-medium text-gray-300 mb-1">
                {getModeLabel()}
              </h3>
              <p className="text-xs sm:text-sm text-gray-500">
                Cycle {cycles + 1} • {mode === "work" ? "Focus" : "Break"}
              </p>
            </div>

            {/* Timer Circle */}
            <div className="relative w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 mx-auto mb-4 sm:mb-6">
              <svg
                className="w-full h-full transform -rotate-90"
                viewBox="0 0 100 100"
              >
                {/* Background Circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="rgba(75, 85, 99, 0.3)"
                  strokeWidth="3"
                />
                {/* Progress Circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke={`url(#gradient-${mode})`}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 45}`}
                  strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress)}`}
                  className="transition-all duration-1000 ease-linear"
                />
                <defs>
                  <linearGradient
                    id="gradient-work"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#ef4444" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                  <linearGradient
                    id="gradient-break"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                  <linearGradient
                    id="gradient-longBreak"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Time Display */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-1">
                    {formatTime(timeLeft)}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-400">
                    {Math.ceil(progress * 100)}% complete
                  </div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-2 sm:gap-4">
              <button
                onClick={resetTimer}
                className="p-2 sm:p-3 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all duration-200"
                title="Reset Timer"
              >
                <RotateCcw size={16} className="sm:w-5 sm:h-5" />
              </button>

              <button
                onClick={isRunning ? pauseTimer : startTimer}
                className={`p-3 sm:p-4 rounded-full transition-all duration-200 ${
                  isRunning
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "bg-green-500 hover:bg-green-600 text-white"
                }`}
                title={isRunning ? "Pause" : "Start"}
              >
                {isRunning ? (
                  <Pause size={20} className="sm:w-6 sm:h-6" />
                ) : (
                  <Play size={20} className="sm:w-6 sm:h-6" />
                )}
              </button>

              <button
                onClick={skipTimer}
                className="p-2 sm:p-3 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all duration-200"
                title="Skip Timer"
              >
                <RotateCcw
                  size={16}
                  className="sm:w-5 sm:h-5 transform scale-x-[-1]"
                />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PomodoroTimer;
