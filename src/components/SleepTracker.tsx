import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Moon,
  Sun,
  Clock,
  TrendingUp,
  Calendar,
  Plus,
  X,
  CheckCircle,
  Star,
  Trash2,
} from "lucide-react";
import SleepChart from "./SleepChart";

interface SleepEntry {
  id: string;
  checkIn: string;
  checkOut: string;
  duration: number; // in minutes
  notes?: string;
  quality?: 1 | 2 | 3 | 4 | 5;
  date: string;
}

interface SleepTrackerProps {
  onAddJournalEntry: (entry: {
    title: string;
    content: string;
    tags: string[];
    date: string;
  }) => void;
}

const SleepTracker: React.FC<SleepTrackerProps> = ({ onAddJournalEntry }) => {
  const [sleepEntries, setSleepEntries] = useState<SleepEntry[]>([]);
  const [isTracking, setIsTracking] = useState(false);
  const [currentCheckIn, setCurrentCheckIn] = useState<string | null>(null);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [sleepNotes, setSleepNotes] = useState("");
  const [sleepQuality, setSleepQuality] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    entryId: string | null;
    entryDate: string;
  }>({
    isOpen: false,
    entryId: null,
    entryDate: "",
  });
  const [checkInConfirmation, setCheckInConfirmation] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<SleepEntry | null>(null);

  useEffect(() => {
    const savedEntries = localStorage.getItem("sleepEntries");
    if (savedEntries) {
      setSleepEntries(JSON.parse(savedEntries));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("sleepEntries", JSON.stringify(sleepEntries));
  }, [sleepEntries]);

  const handleCheckInClick = () => {
    setCheckInConfirmation(true);
  };

  const handleCheckIn = () => {
    const now = new Date().toISOString();
    setCurrentCheckIn(now);
    setIsTracking(true);
    setCheckInConfirmation(false);
  };

  const handleCheckOut = () => {
    if (!currentCheckIn) return;

    const checkOutTime = new Date().toISOString();
    const checkInTime = new Date(currentCheckIn);
    const duration = Math.round(
      (new Date(checkOutTime).getTime() - checkInTime.getTime()) / (1000 * 60)
    ); // in minutes

    const newEntry: SleepEntry = {
      id: Date.now().toString(),
      checkIn: currentCheckIn,
      checkOut: checkOutTime,
      duration,
      date: checkInTime.toISOString().split("T")[0],
    };

    // Store the new entry temporarily for the notes modal
    setCurrentEntry(newEntry);
    setCurrentCheckIn(null);
    setIsTracking(false);
    setIsNotesModalOpen(true);

    // Add the entry to state after opening the modal
    setSleepEntries((prev) => [newEntry, ...prev]);
  };

  const handleSaveNotes = () => {
    if (currentEntry) {
      const checkInDate = new Date(currentEntry.checkIn);
      const checkOutDate = new Date(currentEntry.checkOut);

      // Update the entry with quality and notes
      const updatedEntry = {
        ...currentEntry,
        quality: sleepQuality,
        notes: sleepNotes,
      };

      // Update the entry in the state
      setSleepEntries((prev) =>
        prev.map((entry) =>
          entry.id === currentEntry.id ? updatedEntry : entry
        )
      );

      const title = `Sleep Notes - ${new Date().toLocaleDateString()}`;
      const content = `Sleep Duration: ${formatDuration(currentEntry.duration)}
Check-in: ${checkInDate.toLocaleString()}
Check-out: ${checkOutDate.toLocaleString()}
Sleep Quality: ${"⭐".repeat(sleepQuality)}

Notes:
${sleepNotes}`;

      onAddJournalEntry({
        title,
        content,
        tags: ["sleep", "health"],
        date: new Date().toISOString(),
      });
    }

    setSleepNotes("");
    setSleepQuality(3);
    setCurrentEntry(null);
    setIsNotesModalOpen(false);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateStats = () => {
    if (sleepEntries.length === 0)
      return { averageHours: 0, totalDays: 0, totalSleep: 0 };

    const totalMinutes = sleepEntries.reduce(
      (sum, entry) => sum + entry.duration,
      0
    );

    // Calculate unique days tracked
    const uniqueDays = new Set(sleepEntries.map((entry) => entry.date)).size;

    const averageMinutes = totalMinutes / sleepEntries.length;
    const averageHours = averageMinutes / 60;

    return {
      averageHours: Math.round(averageHours * 10) / 10,
      totalDays: uniqueDays,
      totalSleep: Math.round((totalMinutes / 60) * 10) / 10,
    };
  };

  const handleDeleteClick = (entryId: string, entryDate: string) => {
    setDeleteConfirmation({
      isOpen: true,
      entryId,
      entryDate,
    });
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmation.entryId) {
      setSleepEntries((prev) =>
        prev.filter((entry) => entry.id !== deleteConfirmation.entryId)
      );
    }
    setDeleteConfirmation({
      isOpen: false,
      entryId: null,
      entryDate: "",
    });
  };

  const stats = calculateStats();

  return (
    <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-4 sm:p-6 border border-gray-700/30 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-cyan-400 via-teal-400 to-cyan-600 bg-clip-text text-transparent mb-1 tracking-tight">
            SLEEP TRACKER
          </h3>
          <p className="text-gray-400 text-sm">
            Track your sleep patterns and improve your rest
          </p>
        </div>
      </div>

      {/* Stats and Chart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Stats Card */}
        <div className="bg-gradient-to-br from-cyan-500/10 to-teal-500/10 rounded-xl p-6 border border-cyan-500/20">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-cyan-500/20 to-teal-500/20 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-cyan-400" />
            </div>
            <span className="text-cyan-400 font-medium text-lg">
              Sleep Statistics
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-center">
            <div className="bg-gradient-to-br from-cyan-500/5 to-teal-500/5 rounded-lg p-3 sm:p-4 border border-cyan-500/20 space-y-1">
              <div className="text-2xl sm:text-3xl font-bold text-cyan-400">
                {stats.averageHours}h
              </div>
              <div className="text-xs sm:text-sm text-gray-400">Avg. Sleep</div>
            </div>
            <div className="bg-gradient-to-br from-cyan-500/5 to-teal-500/5 rounded-lg p-3 sm:p-4 border border-cyan-500/20 space-y-1">
              <div className="text-2xl sm:text-3xl font-bold text-cyan-400">
                {stats.totalDays}
              </div>
              <div className="text-xs sm:text-sm text-gray-400">
                Days Tracked
              </div>
            </div>
            <div className="bg-gradient-to-br from-cyan-500/5 to-teal-500/5 rounded-lg p-3 sm:p-4 border border-cyan-500/20 space-y-1">
              <div className="text-2xl sm:text-3xl font-bold text-cyan-400">
                {stats.totalSleep}h
              </div>
              <div className="text-xs sm:text-sm text-gray-400">
                Total Sleep
              </div>
            </div>
          </div>
        </div>

        {/* Sleep Chart */}
        <SleepChart sleepEntries={sleepEntries} />
      </div>

      {/* Check In/Out Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {!isTracking ? (
          <button
            onClick={handleCheckInClick}
            className="group relative px-6 py-4 bg-gradient-to-r from-cyan-600 via-teal-600 to-cyan-700 rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/25 focus:outline-none focus:ring-4 focus:ring-cyan-500/50"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 via-teal-600 to-cyan-700 rounded-xl blur opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center justify-center gap-3">
              <Moon size={20} />
              Check In
            </div>
          </button>
        ) : (
          <button
            onClick={handleCheckOut}
            className="group relative px-6 py-4 bg-gradient-to-r from-orange-600 via-red-600 to-orange-700 rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-orange-500/25 focus:outline-none focus:ring-4 focus:ring-orange-500/50"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-orange-600 via-red-600 to-orange-700 rounded-xl blur opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center justify-center gap-3">
              <Sun size={20} />
              Check Out
            </div>
          </button>
        )}

        {isTracking && (
          <div className="flex items-center gap-3 px-4 py-3 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
            <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
            <span className="text-cyan-400 font-medium">
              Currently sleeping...
            </span>
            <span className="text-gray-400 text-sm">
              Since {currentCheckIn ? formatTime(currentCheckIn) : ""}
            </span>
          </div>
        )}
      </div>

      {/* Recent Sleep Entries */}
      <div className="space-y-3">
        <h4 className="text-lg font-semibold text-white mb-4">
          Recent Sleep Sessions
        </h4>
        {sleepEntries.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-3">🌙</div>
            <p className="text-lg font-medium mb-2">No sleep sessions yet</p>
            <p className="text-sm">
              Start tracking your sleep to see your patterns!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sleepEntries.slice(0, 5).map((entry) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="group bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-xl p-4 border border-gray-700/30"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-cyan-500/20 to-teal-500/20 rounded-lg flex items-center justify-center">
                      <Moon className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <div className="font-medium text-white">
                        {formatDuration(entry.duration)}
                      </div>
                      <div className="text-sm text-gray-400">
                        {new Date(entry.checkIn).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-sm text-gray-400">
                        {formatTime(entry.checkIn)} -{" "}
                        {formatTime(entry.checkOut)}
                      </div>
                      {entry.quality && (
                        <div className="text-cyan-400 text-sm">
                          {entry.quality > 0 && "⭐".repeat(entry.quality)}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() =>
                        handleDeleteClick(
                          entry.id,
                          new Date(entry.checkIn).toLocaleDateString()
                        )
                      }
                      className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                      title="Delete sleep entry"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Sleep Notes Modal */}
      <AnimatePresence>
        {isNotesModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsNotesModalOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 sm:p-8 mx-4 w-full max-w-md shadow-2xl border border-gray-700/50"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/20 to-teal-900/20 rounded-2xl"></div>

              <div className="relative">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-white">
                    Sleep Notes
                  </h2>
                  <button
                    onClick={() => setIsNotesModalOpen(false)}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all duration-200"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Sleep Quality */}
                  <div>
                    <label className="block text-sm sm:text-base font-medium text-gray-300 mb-3">
                      How was your sleep quality?
                    </label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          onClick={() =>
                            setSleepQuality(rating as 1 | 2 | 3 | 4 | 5)
                          }
                          className={`p-2 rounded-lg transition-all duration-200 ${
                            sleepQuality >= rating
                              ? "text-yellow-400 bg-yellow-400/10"
                              : "text-gray-400 hover:text-yellow-400 hover:bg-yellow-400/10"
                          }`}
                        >
                          <Star
                            size={20}
                            fill={
                              sleepQuality >= rating ? "currentColor" : "none"
                            }
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm sm:text-base font-medium text-gray-300 mb-2">
                      Sleep Notes (optional)
                    </label>
                    <textarea
                      value={sleepNotes}
                      onChange={(e) => setSleepNotes(e.target.value)}
                      placeholder="How did you sleep? Any dreams or observations?"
                      rows={4}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-200 hover:bg-gray-700/50 hover:border-gray-600/50 shadow-sm focus:shadow-md resize-none"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-3 justify-end">
                    <button
                      onClick={() => setIsNotesModalOpen(false)}
                      className="w-full sm:w-auto px-6 py-3 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all duration-200 font-medium"
                    >
                      Skip
                    </button>
                    <button
                      onClick={handleSaveNotes}
                      className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-lg font-medium transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/25 focus:outline-none focus:ring-4 focus:ring-cyan-500/50"
                    >
                      Save to Journal
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Dialog */}
      <AnimatePresence>
        {deleteConfirmation.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() =>
                setDeleteConfirmation({
                  isOpen: false,
                  entryId: null,
                  entryDate: "",
                })
              }
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 sm:p-8 mx-4 w-full max-w-md shadow-2xl border border-gray-700/50"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 to-pink-900/20 rounded-2xl"></div>

              <div className="relative">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                    <Trash2 className="w-6 h-6 text-red-400" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl sm:text-2xl font-bold text-white">
                      Delete Sleep Entry
                    </h2>
                  </div>
                  <button
                    onClick={() =>
                      setDeleteConfirmation({
                        isOpen: false,
                        entryId: null,
                        entryDate: "",
                      })
                    }
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all duration-200"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="mb-8">
                  <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                    Are you sure you want to delete the sleep entry from{" "}
                    <span className="text-cyan-400 font-medium">
                      {deleteConfirmation.entryDate}
                    </span>
                    ? This action cannot be undone.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-end">
                  <button
                    onClick={() =>
                      setDeleteConfirmation({
                        isOpen: false,
                        entryId: null,
                        entryDate: "",
                      })
                    }
                    className="w-full sm:w-auto px-6 py-3 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all duration-200 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmDelete}
                    className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg font-medium transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-red-500/25 focus:outline-none focus:ring-4 focus:ring-red-500/50"
                  >
                    Delete Entry
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Check-in Confirmation Dialog */}
      <AnimatePresence>
        {checkInConfirmation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setCheckInConfirmation(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 sm:p-8 mx-4 w-full max-w-md shadow-2xl border border-gray-700/50"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/20 to-teal-900/20 rounded-2xl"></div>

              <div className="relative">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center">
                    <Moon className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl sm:text-2xl font-bold text-white">
                      Start Sleep Tracking?
                    </h2>
                  </div>
                  <button
                    onClick={() => setCheckInConfirmation(false)}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all duration-200"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="mb-8">
                  <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                    Are you ready to start tracking your sleep? This will record
                    your check-in time as{" "}
                    <span className="text-cyan-400 font-medium">
                      {new Date().toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    .
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-end">
                  <button
                    onClick={() => setCheckInConfirmation(false)}
                    className="w-full sm:w-auto px-6 py-3 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all duration-200 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCheckIn}
                    className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-lg font-medium transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/25 focus:outline-none focus:ring-4 focus:ring-cyan-500/50"
                  >
                    Start Tracking
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SleepTracker;
