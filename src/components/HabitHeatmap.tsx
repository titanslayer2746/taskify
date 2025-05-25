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
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-6 border border-gray-700/30 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3
              className={`text-2xl font-extrabold bg-gradient-to-r ${habitColor} bg-clip-text text-transparent mb-1 tracking-tight`}
            >
              {formattedName}
            </h3>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-blue-500/10 px-3 py-1.5 rounded-lg">
              <CalendarCheck className="text-blue-500" size={20} />
              <span className="text-blue-500 font-medium">
                {completedDays} days completed
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
                className="flex items-center gap-2 bg-orange-500/10 px-3 py-1.5 rounded-lg"
              >
                <Flame className="text-orange-500" size={20} />
                <span className="text-orange-500 font-medium">
                  {streakCount} day streak
                </span>
              </motion.div>
            </AnimatePresence>
            <button
              onClick={handleDelete}
              className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-all duration-200"
              title="Delete habit"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </div>

        <div className="mb-4">
          <div
            className="grid gap-[2px] text-xs text-gray-400 mb-2"
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
                      <span className="text-[10px] text-gray-500">
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
          className={`grid gap-[2px] mb-6`}
          style={{
            gridTemplateColumns: `repeat(${totalColumns}, minmax(0, 1fr))`,
            imageRendering: "crisp-edges",
          }}
        >
          {Array.from({ length: totalColumns }, (_, colIndex) => (
            <div key={colIndex} className="grid grid-rows-7 gap-[2px]">
              {Array.from({ length: 7 }, (_, rowIndex) => {
                const dateIndex = colIndex * 7 + rowIndex;
                const date = dates[dateIndex];

                if (!date) {
                  return <div key={rowIndex} className="w-4 h-4" />;
                }

                const isCompleted = habit.completions[date];
                const dateObj = new Date(date);
                const isToday = date === new Date().toISOString().split("T")[0];
                const isFuture = dateObj > new Date();
                const isPast = dateObj < new Date() && !isToday;

                return (
                  <button
                    key={rowIndex}
                    onClick={() =>
                      !isFuture && !isPast && onToggleCompletion(habit.id, date)
                    }
                    disabled={isFuture || isPast}
                    className={`
                      w-4 h-4 rounded-sm transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-purple-500/50 
                      ${
                        isCompleted
                          ? "bg-green-400 hover:bg-green-300"
                          : isFuture
                          ? "bg-gray-800 cursor-not-allowed opacity-50"
                          : isPast
                          ? "bg-gray-700 cursor-not-allowed"
                          : "bg-gray-700 hover:bg-gray-600"
                      }
                      ${isToday ? "ring-2 ring-purple-400" : ""}
                      ${isFuture || isPast ? "hover:scale-100" : ""}
                    `}
                    style={{
                      imageRendering: "crisp-edges",
                      shapeRendering: "crispEdges",
                    }}
                    title={`${dateObj.toLocaleDateString()} - ${
                      isFuture
                        ? "Future date"
                        : isPast
                        ? isCompleted
                          ? "Completed (Past date)"
                          : "Not completed (Past date)"
                        : isCompleted
                        ? "Completed"
                        : "Not completed"
                    }`}
                  />
                );
              })}
            </div>
          ))}
        </div>

        <div className="flex justify-center">
          <button
            onClick={handleMarkToday}
            className="group relative px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-green-500/25 focus:outline-none focus:ring-4 focus:ring-green-500/50"
            title="Mark today as completed"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl blur opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center gap-2">
              <CheckCircle size={20} />
              Mark Today
            </div>
          </button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AnimatePresence>
        {isDeleteDialogOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700/30 w-full max-w-md mx-4"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Delete Habit</h3>
                <button
                  onClick={() => setIsDeleteDialogOpen(false)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all duration-200"
                >
                  <X size={20} />
                </button>
              </div>
              <p className="text-gray-300 mb-6">
                Are you sure you want to delete "{formattedName}"? This action
                cannot be undone.
              </p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setIsDeleteDialogOpen(false)}
                  className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all duration-200 flex items-center gap-2"
                >
                  <Trash2 size={18} />
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default HabitHeatmap;
