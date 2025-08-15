import React from "react";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";

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

  const getBalanceColor = () => {
    if (balance > 0) return "text-emerald-400";
    if (balance < 0) return "text-red-400";
    return "text-gray-400";
  };

  const getBalanceIconColor = () => {
    if (balance > 0) return "from-emerald-500/20 to-teal-500/20";
    if (balance < 0) return "from-red-500/20 to-pink-500/20";
    return "from-gray-500/20 to-gray-600/20";
  };

  const getBalanceIconBg = () => {
    if (balance > 0) return "text-emerald-400";
    if (balance < 0) return "text-red-400";
    return "text-gray-400";
  };

  return (
    <div className="space-y-6 mb-8">
      {/* Balance Card - Full Width */}
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-6 border border-gray-700/30 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <div
            className={`w-12 h-12 bg-gradient-to-r ${getBalanceIconColor()} rounded-xl flex items-center justify-center`}
          >
            <Wallet className={`w-6 h-6 ${getBalanceIconBg()}`} />
          </div>
          <span className="text-sm text-gray-400">Current Balance</span>
        </div>
        <div className="space-y-2">
          <h3 className={`text-4xl font-bold ${getBalanceColor()}`}>
            {formatCurrency(balance)}
          </h3>
          <p className="text-gray-400 text-sm">
            {balance > 0
              ? "You're in the green! 🎉"
              : balance < 0
              ? "You're in the red! ⚠️"
              : "You're breaking even! ⚖️"}
          </p>
        </div>
      </div>

      {/* Income and Expenses Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
    </div>
  );
};

export default FinanceStats;
