import React, { useMemo, useState } from "react";
import { Trash2, CheckCircle, Flame, CalendarCheck, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Habit {
  id: string;
  name: string;
  completions: Record<string, boolean>;
}

interface HabitHeatmapProps {
  habit: Habit;
  onToggleCompletion: (habitId: string, date: string) => void;
  onDelete: (habitId: string) => void;
}

const HabitHeatmap: React.FC<HabitHeatmapProps> = ({
  habit,
  onToggleCompletion,
  onDelete,
}) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const generateYearDates = () => {
    const dates = [];
    const currentYear = new Date().getFullYear();
    const startDate = new Date(currentYear, 0, 1); // January 1st
    const endDate = new Date(currentYear, 11, 31); // December 31st

    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      dates.push(currentDate.toISOString().split("T")[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  };

  const generateMonthLabels = (dates: string[]) => {
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const monthLabels = [];
    let currentMonth = -1;
    let monthStartColumn = 0;

    // Calculate month positions based on vertical layout
    for (let i = 0; i < dates.length; i++) {
      const date = new Date(dates[i]);
      const month = date.getMonth();
      const columnIndex = Math.floor(i / 7); // Each column has 7 days

      if (month !== currentMonth) {
        if (currentMonth !== -1) {
          // Calculate the center position for the previous month
          const monthEndColumn = columnIndex - 1;
          const monthCenter = Math.floor(
            (monthStartColumn + monthEndColumn) / 2
          );
          monthLabels[monthLabels.length - 1].position = monthCenter;
        }

        monthLabels.push({
          name: monthNames[month],
          position: columnIndex,
        });
        currentMonth = month;
        monthStartColumn = columnIndex;
      }
    }

    // Handle the last month
    if (monthLabels.length > 0) {
      const lastColumn = Math.floor((dates.length - 1) / 7);
      const monthCenter = Math.floor((monthStartColumn + lastColumn) / 2);
      monthLabels[monthLabels.length - 1].position = monthCenter;
    }

    return monthLabels;
  };

  const dates = generateYearDates();
  const monthLabels = generateMonthLabels(dates);
  const completedDays = Object.keys(habit.completions).filter(
    (date) => habit.completions[date]
  ).length;
  const streakCount = calculateStreak(habit.completions, dates);

  function calculateStreak(
    completions: Record<string, boolean>,
    dates: string[]
  ): number {
    let streak = 0;
    const today = new Date().toISOString().split("T")[0];
    const todayIndex = dates.indexOf(today);

    if (todayIndex === -1) return 0;

    for (let i = todayIndex; i >= 0; i--) {
      if (completions[dates[i]]) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  // Calculate total columns needed for the grid (7 days per column)
  const totalColumns = Math.ceil(dates.length / 7);

  const handleMarkToday = () => {
    const today = new Date().toISOString().split("T")[0];
    onToggleCompletion(habit.id, today);
  };

  // Generate a consistent color based on the habit name
  const habitColor = useMemo(() => {
    const colors = [
      "from-pink-500 to-rose-500",
      "from-purple-500 to-indigo-500",
      "from-blue-500 to-cyan-500",
      "from-emerald-500 to-teal-500",
      "from-amber-500 to-orange-500",
      "from-fuchsia-500 to-pink-500",
      "from-violet-500 to-purple-500",
      "from-sky-500 to-blue-500",
      "from-green-500 to-emerald-500",
      "from-yellow-500 to-amber-500",
    ];

    // Generate a consistent index based on the habit name
    const index = habit.name
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  }, [habit.name]);

  // Capitalize and format the habit name
  const formattedName = useMemo(() => {
    return habit.name.toUpperCase();
  }, [habit.name]);

  const handleDelete = () => {
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    onDelete(habit.id);
    setIsDeleteDialogOpen(false);
  };

  return (
    <>
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-4 sm:p-6 border border-gray-700/30 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 mb-4 sm:mb-6">
          <div>
            <h3
              className={`text-xl sm:text-2xl font-extrabold bg-gradient-to-r ${habitColor} bg-clip-text text-transparent mb-1 tracking-tight`}
            >
              {formattedName}
            </h3>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2 bg-blue-500/10 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg">
              <CalendarCheck className="text-blue-500" size={18} />
              <span className="text-blue-500 text-sm sm:text-base font-medium">
                {completedDays} days
              </span>
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={streakCount}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.5, opacity: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 15,
                  mass: 1,
                  delay: 0.2,
                }}
                className="flex items-center gap-2 bg-orange-500/10 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg"
              >
                <Flame className="text-orange-500" size={18} />
                <span className="text-orange-500 text-sm sm:text-base font-medium">
                  {streakCount} streak
                </span>
              </motion.div>
            </AnimatePresence>
            <button
              onClick={handleDelete}
              className="p-1.5 sm:p-2 text-gray-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-all duration-200"
              title="Delete habit"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        <div className="mb-3 sm:mb-4">
          <div
            className="grid gap-[2px] text-[10px] sm:text-xs text-gray-400 mb-2"
            style={{
              gridTemplateColumns: `repeat(${totalColumns}, minmax(0, 1fr))`,
            }}
          >
            {Array.from({ length: totalColumns }, (_, colIndex) => {
              const monthLabel = monthLabels.find(
                (label) => label.position === colIndex
              );
              return (
                <div key={colIndex} className="text-center">
                  {monthLabel ? (
                    <div className="flex flex-col items-center">
                      <span>{monthLabel.name}</span>
                      <span className="text-[8px] sm:text-[10px] text-gray-500">
                        {monthLabel.year}
                      </span>
                    </div>
                  ) : (
                    ""
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div
          className={`grid gap-[2px] mb-4 sm:mb-6`}
          style={{
            gridTemplateColumns: `repeat(${totalColumns}, minmax(0, 1fr))`,
            imageRendering: "crisp-edges",
          }}
        >
          {Array.from({ length: 7 }, (_, rowIndex) => (
            <React.Fragment key={rowIndex}>
              {Array.from({ length: totalColumns }, (_, colIndex) => {
                const dateIndex = colIndex * 7 + rowIndex;
                if (dateIndex >= dates.length) return null;

                const date = dates[dateIndex];
                const isCompleted = habit.completions[date] || false;
                const isToday = date === new Date().toISOString().split("T")[0];
                const isFuture = new Date(date) > new Date();
                const isPast = new Date(date) < new Date();

                return (
                  <button
                    key={date}
                    onClick={() => {
                      if (!isFuture) {
                        onToggleCompletion(habit.id, date);
                      }
                    }}
                    className={`relative group w-full aspect-square rounded-sm transition-all duration-200 ${
                      isCompleted
                        ? "bg-green-500/80 hover:bg-green-500"
                        : isToday
                        ? "bg-blue-500/20 hover:bg-blue-500/30"
                        : isFuture
                        ? "bg-gray-800/50 cursor-not-allowed"
                        : "bg-gray-800/50 hover:bg-gray-700/50"
                    }`}
                    disabled={isFuture}
                    title={`${date} - ${
                      isCompleted ? "Completed" : "Not completed"
                    }`}
                  >
                    <div
                      className={`absolute inset-0 flex items-center justify-center text-[8px] sm:text-[10px] font-medium ${
                        isCompleted ? "text-white" : "text-gray-400"
                      } opacity-0 group-hover:opacity-100 transition-opacity duration-200`}
                    >
                      {new Date(date).getDate()}
                    </div>
                  </button>
                );
              })}
            </React.Fragment>
          ))}
        </div>

        <div className="flex justify-center">
          <button
            onClick={handleMarkToday}
            className="flex items-center gap-2 bg-green-500/10 hover:bg-green-500/20 text-green-500 px-3 py-1.5 rounded-lg transition-all duration-200 text-sm sm:text-base"
          >
            <CheckCircle size={18} />
            <span>Mark Today</span>
          </button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AnimatePresence>
        {isDeleteDialogOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-xl p-6 max-w-sm w-full border border-gray-700/30">
              <h3 className="text-xl font-bold text-white mb-4">
                Delete Habit
              </h3>
              <p className="text-gray-300 mb-6">
                Are you sure you want to delete this habit? This action cannot
                be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setIsDeleteDialogOpen(false)}
                  className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default HabitHeatmap;
