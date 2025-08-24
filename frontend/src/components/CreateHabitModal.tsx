import React, { useState } from "react";
import { X, Loader2 } from "lucide-react";

interface CreateHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (name: string) => void;
  isLoading?: boolean;
}

const CreateHabitModal: React.FC<CreateHabitModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}) => {
  const [habitName, setHabitName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (habitName.trim() && !isLoading) {
      onConfirm(habitName.trim());
      setHabitName("");
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setHabitName("");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={handleClose}
      />

      <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 sm:p-8 mx-4 w-full max-w-md shadow-2xl border border-gray-700/50 animate-scale-in">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-violet-900/20 rounded-2xl"></div>

        <div className="relative">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Create New Habit
            </h2>
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="habitName"
                className="block text-sm sm:text-base font-medium text-gray-300 mb-2"
              >
                Habit Name
              </label>
              <input
                id="habitName"
                type="text"
                value={habitName}
                onChange={(e) => setHabitName(e.target.value)}
                placeholder="Enter habit name..."
                className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                maxLength={50}
                autoFocus
                disabled={isLoading}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!habitName.trim() || isLoading}
                className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-lg font-medium transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none focus:outline-none focus:ring-2 focus:ring-purple-500 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Habit"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateHabitModal;
