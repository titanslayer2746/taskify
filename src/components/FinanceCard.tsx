import React from "react";
import { Trash2, X, Copy } from "lucide-react";
import { motion } from "framer-motion";

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

interface FinanceCardProps {
  entry: FinanceEntry;
  onDelete: (id: string) => void;
  onCopy: (entry: FinanceEntry) => void;
  getCategoryIcon: (category: string) => React.ReactNode;
}

const FinanceCard: React.FC<FinanceCardProps> = ({
  entry,
  onDelete,
  onCopy,
  getCategoryIcon,
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getTypeColor = (type: "income" | "expense") => {
    return type === "income" ? "text-emerald-400" : "text-red-400";
  };

  const getTypeBgColor = (type: "income" | "expense") => {
    return type === "income"
      ? "bg-gradient-to-r from-emerald-500/20 to-teal-500/20"
      : "bg-gradient-to-r from-red-500/20 to-pink-500/20";
  };

  // Use a single color for all tags
  const tagClass = "bg-emerald-500/20 text-emerald-300 border-emerald-400/30";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-4 sm:p-6 border border-gray-700/30 backdrop-blur-sm hover:border-gray-600/50 transition-all duration-300"
    >
      {/* Mobile Layout - Stacked */}
      <div className="block sm:hidden">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 ${getTypeBgColor(
                entry.type
              )} rounded-lg flex items-center justify-center`}
            >
              {React.cloneElement(
                getCategoryIcon(entry.category) as React.ReactElement,
                { size: 16 }
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-white mb-1 truncate">
                {entry.title}
              </h3>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span className="truncate">{entry.category}</span>
                <span>•</span>
                <span>{formatDate(entry.date)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onCopy(entry)}
              className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-blue-900/20 rounded-lg transition-all duration-200"
              title="Copy entry"
            >
              <Copy size={16} />
            </button>

            <button
              onClick={() => onDelete(entry.id)}
              className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-all duration-200"
              title="Delete entry"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between mb-3">
          <div className={`text-lg font-bold ${getTypeColor(entry.type)}`}>
            {entry.type === "expense" ? "-" : "+"}
            {formatCurrency(entry.amount)}
          </div>
          <div className="text-xs text-gray-400 capitalize">{entry.type}</div>
        </div>

        {entry.description && (
          <p className="text-sm text-gray-300 mb-3 leading-relaxed">
            {entry.description}
          </p>
        )}

        {entry.tags.length > 0 && (
          <div className="flex flex-wrap sm:gap-2 gap-1.5">
            {entry.tags.map((tag, index) => (
              <span
                key={index}
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border sm:text-sm text-xs ${tagClass}`}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Desktop Layout - Horizontal */}
      <div className="hidden sm:block">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div
              className={`w-12 h-12 ${getTypeBgColor(
                entry.type
              )} rounded-xl flex items-center justify-center`}
            >
              {getCategoryIcon(entry.category)}
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-1">
                {entry.title}
              </h3>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span>{entry.category}</span>
                <span>•</span>
                <span>{formatDate(entry.date)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className={`text-2xl font-bold ${getTypeColor(entry.type)}`}>
                {entry.type === "expense" ? "-" : "+"}
                {formatCurrency(entry.amount)}
              </div>
              <div className="text-sm text-gray-400 capitalize">
                {entry.type}
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => onCopy(entry)}
                className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-900/20 rounded-lg transition-all duration-200"
                title="Copy entry"
              >
                <Copy size={18} />
              </button>

              <button
                onClick={() => onDelete(entry.id)}
                className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-all duration-200"
                title="Delete entry"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        </div>

        {entry.description && (
          <p className="text-gray-300 mb-4 leading-relaxed">
            {entry.description}
          </p>
        )}

        {entry.tags.length > 0 && (
          <div className="flex flex-wrap sm:gap-2 gap-1.5">
            {entry.tags.map((tag, index) => (
              <span
                key={index}
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border sm:text-sm text-xs ${tagClass}`}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default FinanceCard;
