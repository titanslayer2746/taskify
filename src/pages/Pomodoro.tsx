import React, { useState } from "react";
import PomodoroTimer from "../components/PomodoroTimer";
import PomodoroSettings from "../components/PomodoroSettings";
import Navbar from "../components/Navbar";
import { Clock, Settings } from "lucide-react";

const Pomodoro = () => {
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState({
    workTime: 25,
    breakTime: 5,
    longBreakTime: 15,
    longBreakInterval: 4,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <Navbar />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="text-center mb-4 sm:mb-6 lg:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold bg-gradient-to-r from-orange-400 via-red-400 to-orange-600 bg-clip-text text-transparent mb-2 sm:mb-3 tracking-tight leading-tight py-1">
            Pomodoro Timer
          </h1>
          <p className="text-gray-400 text-sm sm:text-base lg:text-lg px-2">
            Stay focused, take breaks, boost productivity
          </p>
        </div>

        {/* Start Timer Button */}
        {!isTimerOpen && (
          <div className="flex flex-col items-center justify-center min-h-[40vh] sm:min-h-[50vh]">
            <div className="text-center mb-6 sm:mb-8 px-4">
              <div className="text-5xl sm:text-6xl lg:text-7xl mb-4 sm:mb-6">
                ⏰
              </div>
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-2 sm:mb-4">
                Ready to Focus?
              </h2>
              <p className="text-gray-400 text-sm sm:text-base lg:text-lg mb-6 sm:mb-8 max-w-md mx-auto px-2">
                Start your Pomodoro session to boost productivity with focused
                work intervals and refreshing breaks.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8 w-full max-w-sm sm:max-w-none px-4 sm:px-0 sm:justify-center">
              <button
                onClick={() => setIsTimerOpen(true)}
                className="group relative px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-orange-600 via-red-600 to-orange-700 rounded-xl font-semibold text-base sm:text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/25 focus:outline-none focus:ring-4 focus:ring-orange-500/50"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-orange-600 via-red-600 to-orange-700 rounded-xl blur opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center justify-center gap-2 sm:gap-3">
                  <Clock size={20} className="sm:w-7 sm:h-7" />
                  <span className="whitespace-nowrap">
                    Start Pomodoro Session
                  </span>
                </div>
              </button>

              <button
                onClick={() => setIsSettingsOpen(true)}
                className="group relative px-4 sm:px-6 py-3 sm:py-4 bg-gray-800/50 border border-gray-700/50 rounded-xl font-semibold text-base sm:text-lg transition-all duration-300 hover:scale-105 hover:bg-gray-700/50 focus:outline-none focus:ring-4 focus:ring-gray-500/50"
              >
                <div className="relative flex items-center justify-center gap-2 sm:gap-3">
                  <Settings size={20} className="sm:w-6 sm:h-6" />
                  <span>Settings</span>
                </div>
              </button>
            </div>

            <div className="text-center w-full px-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 max-w-2xl mx-auto">
                <div className="bg-gray-800/30 rounded-lg p-3 sm:p-4 border border-gray-700/30">
                  <div className="text-xl sm:text-2xl mb-1 sm:mb-2">🔥</div>
                  <h3 className="font-semibold text-white mb-1 text-sm sm:text-base">
                    Focus Time
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-400">
                    25 minutes of deep work
                  </p>
                </div>
                <div className="bg-gray-800/30 rounded-lg p-3 sm:p-4 border border-gray-700/30">
                  <div className="text-xl sm:text-2xl mb-1 sm:mb-2">☕</div>
                  <h3 className="font-semibold text-white mb-1 text-sm sm:text-base">
                    Short Break
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-400">
                    5 minutes to recharge
                  </p>
                </div>
                <div className="bg-gray-800/30 rounded-lg p-3 sm:p-4 border border-gray-700/30 sm:col-span-2 lg:col-span-1">
                  <div className="text-xl sm:text-2xl mb-1 sm:mb-2">🌟</div>
                  <h3 className="font-semibold text-white mb-1 text-sm sm:text-base">
                    Long Break
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-400">
                    15 minutes after 4 cycles
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pomodoro Timer */}
        <PomodoroTimer
          isOpen={isTimerOpen}
          onClose={() => setIsTimerOpen(false)}
          settings={settings}
          onSettingsChange={setSettings}
        />

        {/* Pomodoro Settings */}
        <PomodoroSettings
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          settings={settings}
          onSettingsChange={setSettings}
        />
      </div>
    </div>
  );
};

export default Pomodoro;
