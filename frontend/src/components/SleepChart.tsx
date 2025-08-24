import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, Calendar } from "lucide-react";

interface SleepEntry {
  id: string;
  checkIn: string;
  checkOut?: string; // Optional for active sessions
  duration?: number; // Optional for active sessions
  notes?: string;
  quality?: 1 | 2 | 3 | 4 | 5;
  date: string;
  isActive?: boolean; // true if session is ongoing
}

interface SleepChartProps {
  sleepEntries: SleepEntry[];
}

const SleepChart: React.FC<SleepChartProps> = ({ sleepEntries }) => {
  // Safety check for undefined sleepEntries
  if (!sleepEntries || !Array.isArray(sleepEntries)) {
    return (
      <div className="bg-gradient-to-br from-cyan-500/10 to-teal-500/10 rounded-xl p-4 border border-cyan-500/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-cyan-500/20 to-teal-500/20 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <span className="text-cyan-400 font-medium">Sleep Trend</span>
            <p className="text-gray-400 text-xs">Last 7 days</p>
          </div>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-400">No sleep data available</p>
        </div>
      </div>
    );
  }

  // Get last 7 days of data
  const getLast7Days = () => {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split("T")[0]);
    }
    return dates;
  };

  const last7Days = getLast7Days();

  // Calculate sleep hours for each day
  const getSleepData = () => {
    return last7Days.map((date) => {
      // Filter out active entries and only count completed entries
      const dayEntries = sleepEntries.filter(
        (entry) => entry.date === date && !entry.isActive && entry.duration
      );
      const totalMinutes = dayEntries.reduce(
        (sum, entry) => sum + (entry.duration || 0),
        0
      );
      return {
        date,
        hours: Math.round((totalMinutes / 60) * 10) / 10,
        dayName: new Date(date).toLocaleDateString("en-US", {
          weekday: "short",
        }),
      };
    });
  };

  const sleepData = getSleepData();

  // Debug logging
  console.log("Sleep Entries:", sleepEntries);
  console.log("Last 7 Days:", last7Days);
  console.log("Sleep Data:", sleepData);

  // Use the actual sleep data
  const displayData = sleepData;

  const maxHours = Math.max(...displayData.map((d) => d.hours), 8); // Default to 8 hours if no data

  // Calculate average sleep hours
  const averageHours =
    displayData.reduce((sum, day) => sum + day.hours, 0) / displayData.length;

  return (
    <div className="bg-gradient-to-br from-cyan-500/10 to-teal-500/10 rounded-xl p-4 border border-cyan-500/20">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-r from-cyan-500/20 to-teal-500/20 rounded-lg flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-cyan-400" />
        </div>
        <div>
          <span className="text-cyan-400 font-medium">Sleep Trend</span>
          <p className="text-gray-400 text-xs">Last 7 days</p>
        </div>
      </div>

      {/* Chart Container */}
      <div className="relative h-32 mb-4">
        {/* Grid Lines */}
        <div className="absolute inset-0 flex flex-col justify-between">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((line) => (
            <div
              key={line}
              className="border-t border-cyan-500/10"
              style={{ height: `${100 / 8}%` }}
            />
          ))}
        </div>

        {/* Chart Line */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient
              id="sleepGradient"
              x1="0%"
              y1="0%"
              x2="0%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#0d9488" stopOpacity="0.3" />
            </linearGradient>
          </defs>

          {/* Area Fill */}
          <path
            d={
              displayData
                .map((day, index) => {
                  const x = (index / (displayData.length - 1)) * 100;
                  const y = 100 - (day.hours / maxHours) * 100;
                  return `${index === 0 ? "M" : "L"} ${x} ${y}`;
                })
                .join(" ") + ` L 100 100 L 0 100 Z`
            }
            fill="url(#sleepGradient)"
            opacity="0.3"
          />

          {/* Line */}
          <path
            d={displayData
              .map((day, index) => {
                const x = (index / (displayData.length - 1)) * 100;
                const y = 100 - (day.hours / maxHours) * 100;
                return `${index === 0 ? "M" : "L"} ${x} ${y}`;
              })
              .join(" ")}
            stroke="#06b6d4"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points */}
          {displayData.map((day, index) => {
            const x = (index / (displayData.length - 1)) * 100;
            const y = 100 - (day.hours / maxHours) * 100;
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="2"
                fill="#06b6d4"
                className="drop-shadow-sm"
              />
            );
          })}
        </svg>

        {/* Average Line */}
        {averageHours > 0 && (
          <div
            className="absolute left-0 right-0 border-t-2 border-dashed border-cyan-400/50"
            style={{
              top: `${100 - (averageHours / maxHours) * 100}%`,
            }}
          />
        )}
      </div>

      {/* X-Axis Labels */}
      <div className="flex justify-between text-xs text-gray-400">
        {displayData.map((day, index) => (
          <div key={index} className="flex flex-col items-center">
            <span className="font-medium text-cyan-400">{day.dayName}</span>
            <span className="text-xs">
              {day.hours > 0 ? `${day.hours}h` : "-"}
            </span>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="mt-4 pt-4 border-t border-cyan-500/20">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-cyan-400" />
            <span className="text-gray-400">Average:</span>
          </div>
          <span className="text-cyan-400 font-medium">
            {averageHours > 0
              ? `${Math.round(averageHours * 10) / 10}h`
              : "No data"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SleepChart;
