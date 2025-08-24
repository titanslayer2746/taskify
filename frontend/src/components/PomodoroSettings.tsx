import React, { useState } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PomodoroSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  settings: {
    workTime: number;
    breakTime: number;
    longBreakTime: number;
    longBreakInterval: number;
  };
  onSettingsChange: (settings: {
    workTime: number;
    breakTime: number;
    longBreakTime: number;
    longBreakInterval: number;
  }) => void;
}

const PomodoroSettings: React.FC<PomodoroSettingsProps> = ({
  isOpen,
  onClose,
  settings,
  onSettingsChange,
}) => {
  const [localSettings, setLocalSettings] = useState(settings);

  const handleSave = () => {
    onSettingsChange(localSettings);
    onClose();
  };

  const handleCancel = () => {
    setLocalSettings(settings);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={handleCancel}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 mx-4 w-full max-w-sm sm:max-w-md shadow-2xl border border-gray-700/50"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-orange-900/20 to-red-900/20 rounded-2xl sm:rounded-3xl"></div>

        <div className="relative">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-white">
              Timer Settings
            </h2>
            <button
              onClick={handleCancel}
              className="p-1.5 sm:p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all duration-200"
            >
              <X size={18} className="sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Settings Form */}
          <div className="space-y-4 sm:space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Work Time (minutes)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={localSettings.workTime}
                onChange={(e) =>
                  setLocalSettings({
                    ...localSettings,
                    workTime: parseInt(e.target.value) || 25,
                  })
                }
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
              />
              <p className="text-xs text-gray-500 mt-1">
                Duration of each focus session
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Short Break Time (minutes)
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={localSettings.breakTime}
                onChange={(e) =>
                  setLocalSettings({
                    ...localSettings,
                    breakTime: parseInt(e.target.value) || 5,
                  })
                }
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
              />
              <p className="text-xs text-gray-500 mt-1">
                Duration of short breaks between focus sessions
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Long Break Time (minutes)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={localSettings.longBreakTime}
                onChange={(e) =>
                  setLocalSettings({
                    ...localSettings,
                    longBreakTime: parseInt(e.target.value) || 15,
                  })
                }
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
              />
              <p className="text-xs text-gray-500 mt-1">
                Duration of long breaks after completing cycles
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Long Break Interval
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={localSettings.longBreakInterval}
                onChange={(e) =>
                  setLocalSettings({
                    ...localSettings,
                    longBreakInterval: parseInt(e.target.value) || 4,
                  })
                }
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
              />
              <p className="text-xs text-gray-500 mt-1">
                Number of focus sessions before a long break
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-6 sm:mt-8">
            <button
              onClick={handleCancel}
              className="flex-1 px-3 sm:px-4 py-2 sm:py-3 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all duration-200 font-medium text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg font-medium transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-orange-500/25 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm sm:text-base"
            >
              Save Settings
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PomodoroSettings;
