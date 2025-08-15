import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import FinanceModal from "../components/FinanceModal";
import FinanceCard from "../components/FinanceCard";
import FinanceStats from "../components/FinanceStats";
import FinanceDashboard from "../components/FinanceDashboard";
import ConfirmationDialog from "../components/ConfirmationDialog";
import {
  Plus,
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  BarChart3,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

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

const Finance = () => {
  const [entries, setEntries] = useState<FinanceEntry[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [entryToCopy, setEntryToCopy] = useState<FinanceEntry | null>(null);
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">(
    "all"
  );
  const [sortBy, setSortBy] = useState<"date" | "amount" | "title">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    entryId: string | null;
    entryTitle: string;
  }>({
    isOpen: false,
    entryId: null,
    entryTitle: "",
  });

  useEffect(() => {
    const savedEntries = localStorage.getItem("financeEntries");
    if (savedEntries) {
      setEntries(JSON.parse(savedEntries));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("financeEntries", JSON.stringify(entries));
  }, [entries]);

  const addEntry = (entry: Omit<FinanceEntry, "id">) => {
    const newEntry: FinanceEntry = {
      ...entry,
      id: Date.now().toString(),
    };
    setEntries([newEntry, ...entries]);
    setIsModalOpen(false);
    setEntryToCopy(null);
  };

  const handleDeleteClick = (id: string, title: string) => {
    setDeleteConfirmation({
      isOpen: true,
      entryId: id,
      entryTitle: title,
    });
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmation.entryId) {
      setEntries(
        entries.filter((entry) => entry.id !== deleteConfirmation.entryId)
      );
    }
    setDeleteConfirmation({
      isOpen: false,
      entryId: null,
      entryTitle: "",
    });
  };

  const copyEntry = (entry: FinanceEntry) => {
    setEntryToCopy(entry);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEntryToCopy(null);
  };

  const filteredAndSortedEntries = entries
    .filter((entry) => filterType === "all" || entry.type === filterType)
    .sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "date":
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case "amount":
          comparison = a.amount - b.amount;
          break;
        case "title":
          comparison = a.title.localeCompare(b.title);
          break;
        default:
          comparison = 0;
      }

      return sortOrder === "desc" ? -comparison : comparison;
    });

  const totalIncome = entries
    .filter((entry) => entry.type === "income")
    .reduce((sum, entry) => sum + entry.amount, 0);

  const totalExpenses = entries
    .filter((entry) => entry.type === "expense")
    .reduce((sum, entry) => sum + entry.amount, 0);

  const balance = totalIncome - totalExpenses;

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, React.ReactNode> = {
      "Food & Dining": <TrendingDown className="w-5 h-5" />,
      Transportation: <TrendingDown className="w-5 h-5" />,
      Shopping: <TrendingDown className="w-5 h-5" />,
      Entertainment: <TrendingDown className="w-5 h-5" />,
      Healthcare: <TrendingDown className="w-5 h-5" />,
      Education: <TrendingDown className="w-5 h-5" />,
      Salary: <TrendingUp className="w-5 h-5" />,
      Freelance: <TrendingUp className="w-5 h-5" />,
      Investment: <TrendingUp className="w-5 h-5" />,
      Other: <Wallet className="w-5 h-5" />,
    };
    return icons[category] || <Wallet className="w-5 h-5" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <Navbar />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <FinanceStats
          balance={balance}
          totalIncome={totalIncome}
          totalExpenses={totalExpenses}
        />

        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
          <div className="flex flex-wrap items-center gap-4">
            {/* Filter Buttons */}
            <div className="flex items-center gap-2 bg-gray-800/50 rounded-lg p-1 border border-gray-700/30">
              {(["all", "income", "expense"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-4 py-2 rounded-md font-medium transition-all duration-200 ${
                    filterType === type
                      ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg"
                      : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>

            {/* Sort Controls */}
            <div className="flex items-center gap-2">
              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(e.target.value as "date" | "amount" | "title")
                  }
                  className="appearance-none bg-gray-800/50 border border-gray-700/30 rounded-lg px-4 py-2 pr-10 text-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all duration-200 hover:bg-gray-700/50 hover:border-gray-600/50 cursor-pointer"
                >
                  <option value="date" className="bg-gray-800 text-gray-300">
                    Sort by Date
                  </option>
                  <option value="amount" className="bg-gray-800 text-gray-300">
                    Sort by Amount
                  </option>
                  <option value="title" className="bg-gray-800 text-gray-300">
                    Sort by Title
                  </option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg
                    className="w-4 h-4 text-gray-400"
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

              {/* Sort Order Toggle */}
              <button
                onClick={() =>
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                }
                className="p-2 bg-gray-800/50 border border-gray-700/30 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700/50 hover:border-gray-600/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
                title={`Sort ${
                  sortOrder === "asc" ? "Descending" : "Ascending"
                }`}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  viewBox="0 0 28 28"
                >
                  {/* Three horizontal lines */}
                  <rect
                    x="3"
                    y="6"
                    width="10"
                    height="2.2"
                    rx="1.1"
                    fill="currentColor"
                  />
                  <rect
                    x="3"
                    y="12.4"
                    width="10"
                    height="2.2"
                    rx="1.1"
                    fill="currentColor"
                  />
                  <rect
                    x="3"
                    y="18.8"
                    width="16"
                    height="2.2"
                    rx="1.1"
                    fill="currentColor"
                  />
                  {/* Up or Down Arrow */}
                  {sortOrder === "asc" ? (
                    <g>
                      <line
                        x1="19.5"
                        y1="19"
                        x2="19.5"
                        y2="9"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                      <polyline
                        points="16,12 19.5,9 23,12"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </g>
                  ) : (
                    <g>
                      <line
                        x1="19.5"
                        y1="9"
                        x2="19.5"
                        y2="19"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                      <polyline
                        points="16,16 19.5,19 23,16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </g>
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsDashboardOpen(true)}
              className="group relative px-4 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25 focus:outline-none focus:ring-4 focus:ring-blue-500/50"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 rounded-xl blur opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center gap-2">
                <BarChart3 size={18} />
                Analytics
              </div>
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              className="group relative px-6 py-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/25 focus:outline-none focus:ring-4 focus:ring-emerald-500/50"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 rounded-xl blur opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center gap-2">
                <Plus size={20} />
                Add Entry
              </div>
            </button>
          </div>
        </div>

        {/* Entries List */}
        <div className="space-y-4">
          {filteredAndSortedEntries.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
              <div className="w-24 h-24 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-full flex items-center justify-center mb-6">
                <PiggyBank className="w-12 h-12 text-emerald-400" />
              </div>
              <h3 className="text-2xl font-bold mb-2">No entries yet</h3>
              <p className="text-gray-400 mb-6 max-w-md">
                Start tracking your finances by adding your first income or
                expense entry.
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="group relative px-6 py-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/25 focus:outline-none focus:ring-4 focus:ring-emerald-500/50"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 rounded-xl blur opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center gap-2">
                  <Plus size={20} />
                  Add Your First Entry
                </div>
              </button>
            </div>
          ) : (
            filteredAndSortedEntries.map((entry) => (
              <FinanceCard
                key={entry.id}
                entry={entry}
                onDelete={(id) => handleDeleteClick(id, entry.title)}
                onCopy={copyEntry}
                getCategoryIcon={getCategoryIcon}
              />
            ))
          )}
        </div>
      </div>

      <FinanceModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={addEntry}
        copyFrom={entryToCopy}
      />

      <FinanceDashboard
        isOpen={isDashboardOpen}
        onClose={() => setIsDashboardOpen(false)}
        entries={entries}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={deleteConfirmation.isOpen}
        onClose={() =>
          setDeleteConfirmation({
            isOpen: false,
            entryId: null,
            entryTitle: "",
          })
        }
        onConfirm={handleConfirmDelete}
        title="Delete Entry"
        message={`Are you sure you want to delete "${deleteConfirmation.entryTitle}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default Finance;
