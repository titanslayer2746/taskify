import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
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
import { SleepEntry, CreateSleepData } from "../services/types";
import { apiService } from "../services/api";

interface SleepTrackerProps {
  sleepEntries: SleepEntry[];
  onAddSleepEntry: (entryData: {
    checkIn: string;
    checkOut?: string;
    duration?: number;
    notes?: string;
    quality?: 1 | 2 | 3 | 4 | 5;
    date: string;
    isActive?: boolean;
  }) => void;
  onUpdateSleepEntry: (
    entryId: string,
    updateData: Partial<CreateSleepData>
  ) => void;
  onDeleteSleepEntry: (entryId: string) => void;
  onAddJournalEntry: (entry: {
    title: string;
    content: string;
    tags: string[];
    date: string;
  }) => void;
  isLoading?: boolean;
}

const SleepTracker: React.FC<SleepTrackerProps> = ({
  sleepEntries,
  onAddSleepEntry,
  onUpdateSleepEntry,
  onDeleteSleepEntry,
  onAddJournalEntry,
  isLoading = false,
}) => {
  const navigate = useNavigate();
  const [isTracking, setIsTracking] = useState(false);
  const [currentEntryId, setCurrentEntryId] = useState<string | null>(null);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [sleepNotes, setSleepNotes] = useState("");
  const [sleepQuality, setSleepQuality] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [isCreatingJournal, setIsCreatingJournal] = useState(false);
  const [checkInTime, setCheckInTime] = useState<Date | null>(null);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
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

  // Use refs to track previous values and prevent unnecessary effect runs
  const prevActiveEntryRef = useRef<string | null>(null);
  const prevCheckInTimeRef = useRef<Date | null>(null);
  const prevIsNotesModalOpenRef = useRef<boolean>(false);
  const effectRunCountRef = useRef<number>(0);

  // Find the active sleep entry
  const activeEntry = useMemo(
    () => sleepEntries.find((entry) => entry.isActive),
    [sleepEntries]
  );

  useEffect(() => {
    const currentActiveEntryId = activeEntry?.id || null;
    const currentCheckInTime = checkInTime;
    const currentIsNotesModalOpen = isNotesModalOpen;

    // Check if values have actually changed
    const activeEntryChanged =
      prevActiveEntryRef.current !== currentActiveEntryId;
    const checkInTimeChanged =
      prevCheckInTimeRef.current !== currentCheckInTime;
    const notesModalChanged =
      prevIsNotesModalOpenRef.current !== currentIsNotesModalOpen;

    if (!activeEntryChanged && !checkInTimeChanged && !notesModalChanged) {
      console.log("No meaningful changes, skipping effect");
      return;
    }

    effectRunCountRef.current += 1;
    console.log(
      "SleepTracker useEffect triggered (run #" +
        effectRunCountRef.current +
        ")",
      {
        activeEntry: currentActiveEntryId,
        checkInTime: currentCheckInTime,
        isNotesModalOpen: currentIsNotesModalOpen,
        changes: { activeEntryChanged, checkInTimeChanged, notesModalChanged },
      }
    );

    // Update refs
    prevActiveEntryRef.current = currentActiveEntryId;
    prevCheckInTimeRef.current = currentCheckInTime;
    prevIsNotesModalOpenRef.current = currentIsNotesModalOpen;

    // Check if there's an active sleep session
    if (activeEntry) {
      setIsTracking(true);
      setCurrentEntryId(activeEntry.id);

      // If this is a fresh active entry (just created), set cooldown
      if (!checkInTime) {
        const checkInDate = new Date(activeEntry.checkIn);
        const now = new Date();
        const timeDiff = Math.max(
          0,
          60 - Math.floor((now.getTime() - checkInDate.getTime()) / 1000)
        );

        if (timeDiff > 0) {
          setCooldownRemaining(timeDiff);
        }
      }
    } else {
      setIsTracking(false);
      // Don't clear currentEntryId here - it might be needed for the notes modal
      // Only clear it if we're not in the notes modal
      if (!isNotesModalOpen) {
        setCurrentEntryId(null);
      }
      setCheckInTime(null);
      setCooldownRemaining(0);
    }
  }, [activeEntry, checkInTime, isNotesModalOpen]);

  // Handle cooldown timer
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (cooldownRemaining > 0) {
      interval = setInterval(() => {
        setCooldownRemaining((prev) => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [cooldownRemaining]);

  const handleCheckInClick = () => {
    setCheckInConfirmation(true);
  };

  const handleCheckIn = () => {
    const now = new Date().toISOString();
    const today = new Date().toISOString().split("T")[0];

    // Create a partial sleep entry (check-in only)
    const sleepEntryData = {
      checkIn: now,
      date: today,
      isActive: true,
    };

    // Call the API to create the sleep entry
    onAddSleepEntry(sleepEntryData);
    setCheckInTime(new Date());
    setCooldownRemaining(60); // 60 seconds cooldown
    setCheckInConfirmation(false);
  };

  const handleCheckOut = () => {
    console.log("handleCheckOut called");
    console.log("currentEntryId in handleCheckOut:", currentEntryId);

    if (!currentEntryId) return;

    const checkOutTime = new Date().toISOString();
    const activeEntry = sleepEntries.find(
      (entry) => entry.id === currentEntryId
    );

    if (!activeEntry) return;

    const checkInTime = new Date(activeEntry.checkIn);
    const duration = Math.round(
      (new Date(checkOutTime).getTime() - checkInTime.getTime()) / (1000 * 60)
    ); // in minutes

    // Update the sleep entry with check-out time and duration
    const updateData = {
      checkOut: checkOutTime,
      duration,
      isActive: false,
    };

    console.log("Updating sleep entry with:", updateData);
    onUpdateSleepEntry(currentEntryId, updateData);
    setIsTracking(false);
    // Don't clear currentEntryId here - keep it for the notes modal
    setIsNotesModalOpen(true);
    console.log("Notes modal opened, currentEntryId should be preserved");
  };

  const handleSaveNotes = async () => {
    console.log("called first time");
    console.log("currentEntryId:", currentEntryId);
    console.log("sleepEntries:", sleepEntries);
    console.log("isNotesModalOpen:", isNotesModalOpen);

    if (!currentEntryId) {
      console.log("currentEntryId is null/undefined, returning early");
      return;
    }
    console.log("called second time");

    const activeEntry = sleepEntries.find(
      (entry) => entry.id === currentEntryId
    );
    console.log("called third time");
    console.log("activeEntry:", activeEntry);

    if (!activeEntry) {
      console.log("activeEntry not found, returning early");
      return;
    }
    console.log("called fourth time");

    try {
      console.log("called fifth time");
      setIsCreatingJournal(true);

      // Update the sleep entry with quality and notes
      const updateData = {
        quality: sleepQuality,
        notes: sleepNotes,
      };
      console.log("called sixth time");
      console.log("updateData:", updateData);

      await onUpdateSleepEntry(currentEntryId, updateData);

      // Create journal entry with sleep data
      const checkInDate = new Date(activeEntry.checkIn);
      const checkOutDate = activeEntry.checkOut
        ? new Date(activeEntry.checkOut)
        : new Date();
      const duration = activeEntry.duration || 0;

      const title = `Sleep Notes - ${new Date().toLocaleDateString()}`;
      const content = `Sleep Duration: ${formatDuration(duration)}
Check-in: ${checkInDate.toLocaleString()}
Check-out: ${checkOutDate.toLocaleString()}
Sleep Quality: ${"⭐".repeat(sleepQuality)}

Notes:
${sleepNotes}`;

      // Call the journal API directly
      console.log("Creating journal entry with data:", {
        title,
        content,
        tags: ["sleep", "health"],
      });

      const journalResponse = await apiService.createJournalEntry({
        title,
        content,
        tags: ["sleep", "health"],
      });

      console.log("Journal entry created successfully:", journalResponse);

      // Clear state and redirect
      setCurrentEntryId(null);
      setSleepNotes("");
      setSleepQuality(3);
      setIsNotesModalOpen(false);
      navigate("/journal");
    } catch (error) {
      console.error("Error saving sleep notes:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        response: error.response?.data,
      });
      alert("Failed to save sleep notes. Please try again.");
    } finally {
      setIsCreatingJournal(false);
    }
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

  const formatCooldownTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const calculateStats = () => {
    if (sleepEntries.length === 0)
      return {
        averageDuration: 0,
        averageQuality: 0,
        totalEntries: 0,
        thisWeek: 0,
      };

    // Filter out active entries for stats calculation
    const completedEntries = sleepEntries.filter(
      (entry) => !entry.isActive && entry.duration
    );

    if (completedEntries.length === 0)
      return {
        averageDuration: 0,
        averageQuality: 0,
        totalEntries: 0,
        thisWeek: 0,
      };

    const totalDuration = completedEntries.reduce(
      (sum, entry) => sum + (entry.duration || 0),
      0
    );
    const totalQuality = completedEntries.reduce(
      (sum, entry) => sum + (entry.quality || 3),
      0
    );

    const thisWeek = completedEntries.filter((entry) => {
      const entryDate = new Date(entry.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return entryDate >= weekAgo;
    }).length;

    return {
      averageDuration: Math.round(totalDuration / completedEntries.length),
      averageQuality: Math.round(totalQuality / completedEntries.length),
      totalEntries: completedEntries.length,
      thisWeek,
    };
  };

  const stats = calculateStats();

  // Filter out active entries for display
  const displayEntries = sleepEntries
    .filter((entry) => !entry.isActive)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Sleep Tracker</h2>
          <p className="text-gray-400">
            Track your sleep patterns and improve your rest
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-gray-400">Average Duration</p>
            <p className="text-xl font-bold text-white">
              {formatDuration(stats.averageDuration)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">This Week</p>
            <p className="text-xl font-bold text-white">{stats.thisWeek}</p>
          </div>
        </div>
      </div>

      {/* Check-in/Check-out Button */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/30">
        {!isTracking ? (
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-cyan-500/20 rounded-full flex items-center justify-center">
                <Moon className="w-8 h-8 text-cyan-400" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Start Sleep Tracking?
            </h3>
            <p className="text-gray-400 mb-6">
              This will start tracking your sleep session from now.
            </p>
            <button
              onClick={handleCheckInClick}
              disabled={isLoading}
              className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Starting..." : "Check In"}
            </button>
          </div>
        ) : (
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center animate-pulse">
                <Sun className="w-8 h-8 text-green-400" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Sleep Session Active
            </h3>
            <p className="text-gray-400 mb-6">
              Your sleep session is being tracked. Click below to end it.
            </p>

            {cooldownRemaining > 0 ? (
              <div className="space-y-3">
                <div className="text-sm text-gray-400">
                  Please wait before checking out
                </div>
                <div className="text-lg font-mono text-yellow-400">
                  {formatCooldownTime(cooldownRemaining)}
                </div>
                <button
                  disabled={true}
                  className="px-6 py-3 bg-gray-500 text-white font-medium rounded-lg cursor-not-allowed"
                >
                  Check Out (Cooldown)
                </button>
              </div>
            ) : (
              <button
                onClick={handleCheckOut}
                disabled={isLoading}
                className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Ending..." : "Check Out"}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Sleep Chart */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/30">
        <h3 className="text-lg font-semibold text-white mb-4">Sleep Trends</h3>
        <SleepChart sleepEntries={displayEntries} />
      </div>

      {/* Recent Entries */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/30">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-white">
              Recent Sleep Sessions
            </h4>
            <span className="text-sm text-gray-400">
              {displayEntries.length} entries
            </span>
          </div>

          {displayEntries.length === 0 ? (
            <div className="text-center py-8">
              <div className="flex justify-center mb-4">
                <Moon className="w-8 h-8 text-cyan-400" />
              </div>
              <h5 className="text-lg font-medium text-white mb-2">
                No sleep entries yet
              </h5>
              <p className="text-gray-400 text-sm">
                Start tracking your sleep to see your patterns here
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {displayEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/30"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < (entry.quality || 3)
                                  ? "text-yellow-400 fill-current"
                                  : "text-gray-500"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-medium text-white">
                          {formatDuration(entry.duration || 0)}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span>
                          {formatTime(entry.checkIn)} -{" "}
                          {entry.checkOut
                            ? formatTime(entry.checkOut)
                            : "Active"}
                        </span>
                        <span>•</span>
                        <span>{new Date(entry.date).toLocaleDateString()}</span>
                      </div>
                      {entry.notes && (
                        <p className="text-sm text-gray-300 mt-2">
                          {entry.notes}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() =>
                        setDeleteConfirmation({
                          isOpen: true,
                          entryId: entry.id,
                          entryDate: new Date(entry.date).toLocaleDateString(),
                        })
                      }
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Check-in Confirmation Modal */}
      <AnimatePresence>
        {checkInConfirmation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 border border-gray-700/30"
            >
              <div className="text-center mb-6">
                <div className="flex justify-center mb-4">
                  <Moon className="w-8 h-8 text-cyan-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Start Sleep Tracking?
                </h3>
                <p className="text-gray-400">
                  This will start tracking your sleep session from now.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setCheckInConfirmation(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCheckIn}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {isLoading ? "Starting..." : "Start Tracking"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notes Modal */}
      <AnimatePresence>
        {isNotesModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 border border-gray-700/30"
            >
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-white mb-2">
                  Sleep Session Complete!
                </h3>
                <p className="text-gray-400">
                  How was your sleep? Add some notes and rate your sleep
                  quality.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Sleep Quality
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() =>
                          setSleepQuality(rating as 1 | 2 | 3 | 4 | 5)
                        }
                        className={`p-2 rounded-lg transition-all duration-200 ${
                          sleepQuality >= rating
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-gray-700/50 text-gray-400 hover:bg-gray-600/50"
                        }`}
                      >
                        <Star className="w-5 h-5" />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Notes (optional)
                  </label>
                  <textarea
                    value={sleepNotes}
                    onChange={(e) => setSleepNotes(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 resize-none"
                    rows={3}
                    placeholder="How did you sleep? Any observations..."
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setIsNotesModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Skip
                </button>
                <button
                  onClick={handleSaveNotes}
                  disabled={isLoading || isCreatingJournal}
                  className="flex-1 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {isCreatingJournal ? "Creating Journal..." : "Save Notes"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmation.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 border border-gray-700/30"
            >
              <div className="text-center mb-6">
                <div className="flex justify-center mb-4">
                  <Trash2 className="w-8 h-8 text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Delete Sleep Entry?
                </h3>
                <p className="text-gray-400 mb-6">
                  Are you sure you want to delete the sleep entry from{" "}
                  <span className="text-white">
                    {deleteConfirmation.entryDate}
                  </span>
                  ? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() =>
                      setDeleteConfirmation({
                        isOpen: false,
                        entryId: null,
                        entryDate: "",
                      })
                    }
                    className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (deleteConfirmation.entryId) {
                        onDeleteSleepEntry(deleteConfirmation.entryId);
                      }
                      setDeleteConfirmation({
                        isOpen: false,
                        entryId: null,
                        entryDate: "",
                      });
                    }}
                    disabled={isLoading}
                    className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isLoading ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SleepTracker;
