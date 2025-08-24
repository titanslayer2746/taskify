import React, { useMemo, useState } from "react";
import { X, TrendingUp, TrendingDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface FinanceEntry {
  id: string;
  title: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  tags: string[];
  date: string;
  description?: string;
}

interface FinanceDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  entries: FinanceEntry[];
}

const FinanceDashboard: React.FC<FinanceDashboardProps> = ({
  isOpen,
  onClose,
  entries,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<
    "week" | "month" | "year"
  >("year");

  const analytics = useMemo(() => {
    // Filter data based on selected period
    const now = new Date();
    let startDate: Date;

    switch (selectedPeriod) {
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "year":
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    }

    const filteredData = entries.filter((entry) => {
      const entryDate = new Date(entry.date);
      return entryDate >= startDate && entryDate <= now;
    });

    // Group data based on selected period
    const groupedData: { [key: string]: { income: number; expenses: number } } =
      {};

    if (selectedPeriod === "week") {
      // Group by day for week view
      filteredData.forEach((entry) => {
        const date = new Date(entry.date);
        const dayKey = date.toISOString().split("T")[0]; // YYYY-MM-DD format

        if (!groupedData[dayKey]) {
          groupedData[dayKey] = { income: 0, expenses: 0 };
        }

        if (entry.type === "income") {
          groupedData[dayKey].income += entry.amount;
        } else {
          groupedData[dayKey].expenses += entry.amount;
        }
      });
    } else if (selectedPeriod === "month") {
      // Group by week for month view
      filteredData.forEach((entry) => {
        const date = new Date(entry.date);
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)
        const weekKey = weekStart.toISOString().split("T")[0];

        if (!groupedData[weekKey]) {
          groupedData[weekKey] = { income: 0, expenses: 0 };
        }

        if (entry.type === "income") {
          groupedData[weekKey].income += entry.amount;
        } else {
          groupedData[weekKey].expenses += entry.amount;
        }
      });
    } else {
      // Group by month for year view
      filteredData.forEach((entry) => {
        const date = new Date(entry.date);
        const monthKey = `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}`;

        if (!groupedData[monthKey]) {
          groupedData[monthKey] = { income: 0, expenses: 0 };
        }

        if (entry.type === "income") {
          groupedData[monthKey].income += entry.amount;
        } else {
          groupedData[monthKey].expenses += entry.amount;
        }
      });
    }

    // Convert to array and sort
    const result = {
      totalIncome: filteredData
        .filter((entry) => entry.type === "income")
        .reduce((sum, entry) => sum + entry.amount, 0),
      totalExpenses: filteredData
        .filter((entry) => entry.type === "expense")
        .reduce((sum, entry) => sum + entry.amount, 0),
      monthlyData: Object.entries(groupedData)
        .map(([key, data]) => ({
          month: key,
          income: data.income,
          expenses: data.expenses,
        }))
        .sort((a, b) => a.month.localeCompare(b.month)),
    };

    return result;
  }, [entries, selectedPeriod]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatMonth = (monthKey: string) => {
    if (selectedPeriod === "week") {
      // Format as day for week view
      const date = new Date(monthKey);
      return date.toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
      });
    } else if (selectedPeriod === "month") {
      // Format as week for month view
      const date = new Date(monthKey);
      const weekEnd = new Date(date);
      weekEnd.setDate(date.getDate() + 6);
      return `${date.toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
      })} - ${weekEnd.toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
      })}`;
    } else {
      // Format as month for year view
      const [year, month] = monthKey.split("-");
      const date = new Date(parseInt(year), parseInt(month) - 1);
      return date.toLocaleDateString("en-IN", {
        month: "short",
        year: "numeric",
      });
    }
  };

  const getMaxAmount = () => {
    if (analytics.monthlyData.length === 0) return 0;
    const maxIncome = Math.max(...analytics.monthlyData.map((d) => d.income));
    const maxExpenses = Math.max(
      ...analytics.monthlyData.map((d) => d.expenses)
    );
    return Math.max(maxIncome, maxExpenses);
  };

  const maxAmount = getMaxAmount();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700/30 w-full max-w-6xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-gradient-to-r from-gray-800 to-gray-900 rounded-t-2xl p-4 sm:p-6 border-b border-gray-700/30">
              <div className="flex items-center justify-between">
                <h2 className="text-lg sm:text-2xl font-bold text-white">
                  Finance Analytics Dashboard
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all duration-200"
                >
                  <X size={20} className="sm:w-6 sm:h-6" />
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-4 border border-gray-700/30">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-400" />
                    </div>
                    <span className="text-xs sm:text-sm text-gray-400">
                      Total Income
                    </span>
                  </div>
                  <div className="text-lg sm:text-2xl font-bold text-emerald-400">
                    {formatCurrency(analytics.totalIncome)}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-4 border border-gray-700/30">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
                      <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 text-red-400" />
                    </div>
                    <span className="text-xs sm:text-sm text-gray-400">
                      Total Expenses
                    </span>
                  </div>
                  <div className="text-lg sm:text-2xl font-bold text-red-400">
                    {formatCurrency(analytics.totalExpenses)}
                  </div>
                </div>
              </div>

              {/* Income vs Expenses Chart */}
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-4 sm:p-6 border border-gray-700/30">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3">
                  <h3 className="text-lg sm:text-xl font-bold text-white">
                    Income vs Expenses Trend
                  </h3>

                  {/* Time Period Filter Buttons */}
                  <div className="flex gap-1 sm:gap-2">
                    <button
                      onClick={() => setSelectedPeriod("week")}
                      className={`px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 ${
                        selectedPeriod === "week"
                          ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25"
                          : "bg-gray-700/50 text-gray-300 hover:bg-gray-700 hover:text-white"
                      }`}
                    >
                      Last Week
                    </button>
                    <button
                      onClick={() => setSelectedPeriod("month")}
                      className={`px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 ${
                        selectedPeriod === "month"
                          ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25"
                          : "bg-gray-700/50 text-gray-300 hover:bg-gray-700 hover:text-white"
                      }`}
                    >
                      Last Month
                    </button>
                    <button
                      onClick={() => setSelectedPeriod("year")}
                      className={`px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 ${
                        selectedPeriod === "year"
                          ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25"
                          : "bg-gray-700/50 text-gray-300 hover:bg-gray-700 hover:text-white"
                      }`}
                    >
                      Last Year
                    </button>
                  </div>
                </div>

                {analytics.monthlyData.length > 0 ? (
                  <div className="space-y-4">
                    {/* Line Chart */}
                    <div className="h-48 sm:h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={analytics.monthlyData}
                          margin={{
                            top: 10,
                            right: 20,
                            left: 10,
                            bottom: 10,
                          }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#374151"
                            opacity={0.3}
                          />
                          <XAxis
                            dataKey="month"
                            tickFormatter={formatMonth}
                            stroke="#9CA3AF"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            angle={-45}
                            textAnchor="end"
                            height={60}
                          />
                          <YAxis
                            tickFormatter={(value) => formatCurrency(value)}
                            stroke="#9CA3AF"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            width={60}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#1F2937",
                              border: "1px solid #374151",
                              borderRadius: "8px",
                              color: "#F9FAFB",
                              fontSize: "12px",
                            }}
                            labelFormatter={(label) => formatMonth(label)}
                            formatter={(value: number) => [
                              formatCurrency(value),
                              "",
                            ]}
                          />
                          <Legend
                            wrapperStyle={{
                              color: "#F9FAFB",
                              fontSize: "12px",
                            }}
                          />
                          <Line
                            type="linear"
                            dataKey="income"
                            stroke="#10B981"
                            strokeWidth={2}
                            dot={{
                              fill: "#10B981",
                              strokeWidth: 1,
                              r: 3,
                            }}
                            activeDot={{
                              r: 4,
                              stroke: "#10B981",
                              strokeWidth: 1,
                              fill: "#1F2937",
                            }}
                            name="Income"
                          />
                          <Line
                            type="linear"
                            dataKey="expenses"
                            stroke="#EF4444"
                            strokeWidth={2}
                            dot={{
                              fill: "#EF4444",
                              strokeWidth: 1,
                              r: 3,
                            }}
                            activeDot={{
                              r: 4,
                              stroke: "#EF4444",
                              strokeWidth: 1,
                              fill: "#1F2937",
                            }}
                            name="Expenses"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 sm:py-12">
                    <p className="text-gray-400 text-sm sm:text-base">
                      No data available for the selected period
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default FinanceDashboard;
