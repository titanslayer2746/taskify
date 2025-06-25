import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface FinanceStatsProps {
  balance: number;
  totalIncome: number;
  totalExpenses: number;
}

const FinanceStats: React.FC<FinanceStatsProps> = ({
  balance,
  totalIncome,
  totalExpenses,
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {/* Income Card */}
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-6 border border-gray-700/30 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-emerald-400" />
          </div>
          <span className="text-sm text-gray-400">Total Income</span>
        </div>
        <div className="space-y-2">
          <h3 className="text-3xl font-bold text-emerald-400">
            {formatCurrency(totalIncome)}
          </h3>
          <p className="text-gray-400 text-sm">All time income</p>
        </div>
      </div>

      {/* Expenses Card */}
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-6 border border-gray-700/30 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-red-500/20 to-pink-500/20 rounded-xl flex items-center justify-center">
            <TrendingDown className="w-6 h-6 text-red-400" />
          </div>
          <span className="text-sm text-gray-400">Total Expenses</span>
        </div>
        <div className="space-y-2">
          <h3 className="text-3xl font-bold text-red-400">
            {formatCurrency(totalExpenses)}
          </h3>
          <p className="text-gray-400 text-sm">All time expenses</p>
        </div>
      </div>
    </div>
  );
};

export default FinanceStats;
