import React, { useState, useEffect } from "react";
import { X, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

interface FinanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (entry: Omit<FinanceEntry, "id">) => void;
  copyFrom?: FinanceEntry | null;
}

const FinanceModal: React.FC<FinanceModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  copyFrom,
}) => {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const incomeCategories = [
    "Salary",
    "Freelance",
    "Investment",
    "Business",
    "Other",
  ];

  const expenseCategories = [
    "Food & Dining",
    "Transportation",
    "Shopping",
    "Entertainment",
    "Healthcare",
    "Education",
    "Bills & Utilities",
    "Housing",
    "Other",
  ];

  const currentCategories =
    type === "income" ? incomeCategories : expenseCategories;

  useEffect(() => {
    if (isOpen) {
      if (copyFrom) {
        // Pre-fill form with copied entry data
        setTitle(copyFrom.title);
        setAmount(copyFrom.amount.toString());
        setType(copyFrom.type);
        setCategory(copyFrom.category);
        setTags([...copyFrom.tags]);
        setTagInput("");
        setDescription(copyFrom.description || "");
        setDate(new Date().toISOString().split("T")[0]); // Use current date for copy
      } else {
        // Reset form for new entry
        setTitle("");
        setAmount("");
        setType("expense");
        setCategory("");
        setTags([]);
        setTagInput("");
        setDescription("");
        setDate(new Date().toISOString().split("T")[0]);
      }
    }
  }, [isOpen, copyFrom]);

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim() && tags.length < 7) {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (!tags.includes(newTag)) {
        setTags([...tags, newTag]);
        setTagInput("");
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !amount.trim() || !category) {
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return;
    }

    onConfirm({
      title: title.trim(),
      amount: numAmount,
      type,
      category,
      tags,
      date,
      description: description.trim() || undefined,
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700/30 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                {copyFrom ? "Copy Finance Entry" : "Add Finance Entry"}
              </h2>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all duration-200"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Type
                </label>
                <div className="flex gap-3">
                  {(["expense", "income"] as const).map((entryType) => (
                    <button
                      key={entryType}
                      type="button"
                      onClick={() => setType(entryType)}
                      className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                        type === entryType
                          ? entryType === "income"
                            ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg"
                            : "bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-lg"
                          : "bg-gray-700/50 text-gray-300 hover:bg-gray-700"
                      }`}
                    >
                      {entryType.charAt(0).toUpperCase() + entryType.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Main Input Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all duration-200 hover:bg-gray-600/50 hover:border-gray-500/50 shadow-sm focus:shadow-md"
                    placeholder="Enter title..."
                    required
                  />
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Amount (₹) *
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all duration-200 hover:bg-gray-600/50 hover:border-gray-500/50 shadow-sm focus:shadow-md"
                    placeholder="0"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Category *
                  </label>
                  <div className="relative">
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="appearance-none w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all duration-200 hover:bg-gray-600/50 hover:border-gray-500/50 cursor-pointer pr-10"
                      required
                    >
                      <option value="" className="bg-gray-800 text-gray-300">
                        Select category
                      </option>
                      {currentCategories.map((cat) => (
                        <option
                          key={cat}
                          value={cat}
                          className="bg-gray-800 text-gray-300"
                        >
                          {cat}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Secondary Input Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all duration-200 hover:bg-gray-600/50 hover:border-gray-500/50 shadow-sm focus:shadow-md"
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tags ({tags.length}/7)
                  </label>
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all duration-200 hover:bg-gray-600/50 hover:border-gray-500/50 shadow-sm focus:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder={
                      tags.length >= 7
                        ? "Maximum tags reached"
                        : "Type tag and press Enter..."
                    }
                    disabled={tags.length >= 7}
                  />
                </div>
              </div>

              {/* Tags Display */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 text-sm rounded-full border border-emerald-500/30 shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:text-red-400 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all duration-200 hover:bg-gray-600/50 hover:border-gray-500/50 shadow-sm focus:shadow-md resize-none"
                  placeholder="Add any additional details..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 bg-gray-700/50 hover:bg-gray-700 text-gray-300 rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500/50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/25 focus:outline-none focus:ring-4 focus:ring-emerald-500/50"
                >
                  {copyFrom ? "Copy Entry" : "Add Entry"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default FinanceModal;
