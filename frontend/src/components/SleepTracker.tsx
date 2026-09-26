import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Moon, Sun, Trash2 } from "lucide-react";
import ConfirmationDialog from "./ConfirmationDialog";
import PaperDialog, { PaperButton } from "./paper/PaperDialog";
import { PaperStat, SectionHeading } from "./paper/PaperPage";
import {
  paperIconButton,
  paperKicker,
  paperLabel,
  paperSheet,
  paperTextarea,
} from "@/lib/paper";
import SleepChart from "./SleepChart";
import type { SleepTrackerProps } from "../services/types";
import { apiService } from "../services/api";

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
  const [notesError, setNotesError] = useState<string | null>(null);

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
      setNotesError(null);

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
      setNotesError("The notes didn't save. Please try again.");
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

  // Live "asleep for" clock while a session is open.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!isTracking) return;
    setNow(Date.now());
    const tick = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(tick);
  }, [isTracking]);
  const elapsedMinutes = activeEntry
    ? Math.max(0, Math.floor((now - new Date(activeEntry.checkIn).getTime()) / 60000))
    : 0;
  const elapsed = `${Math.floor(elapsedMinutes / 60)}h ${String(elapsedMinutes % 60).padStart(2, "0")}m`;

  const stats = calculateStats();

  const completedEntries = sleepEntries.filter((entry) => !entry.isActive);
  const displayEntries = completedEntries.slice(0, 7);

  const qualityWords = ["", "Awful", "Poor", "Okay", "Good", "Great"];

  const closeDelete = () =>
    setDeleteConfirmation({ isOpen: false, entryId: null, entryDate: "" });

  return (
    <div className="mt-12 space-y-20">
      {/* Tonight */}
      <section aria-label="Sleep session" className="grid gap-10 lg:grid-cols-12">
        <div className={`relative lg:col-span-7 ${paperSheet} px-8 py-10 sm:px-12`}>
          {!isTracking ? (
            <>
              <p className={paperKicker}>Tonight</p>
              <p className="mt-4 font-display text-5xl leading-[1.02]">
                Going to bed?
              </p>
              <p className="mt-4 max-w-md leading-relaxed text-ink-soft">
                Check in when you turn the light off and check out when you
                get up. The hours are worked out for you.
              </p>
              <PaperButton
                onClick={handleCheckInClick}
                disabled={isLoading}
                className="mt-8"
              >
                <Moon size={16} />
                {isLoading ? "Starting…" : "Check in"}
              </PaperButton>
            </>
          ) : (
            <>
              <p className={`${paperKicker} flex items-center gap-2`}>
                <span className="h-2 w-2 animate-pulse rounded-full bg-clay" />
                Asleep since {activeEntry ? formatTime(activeEntry.checkIn) : "—"}
              </p>
              <p className="mt-4 font-ledger text-6xl tabular-nums tracking-tight sm:text-7xl">
                {elapsed}
              </p>
              <p className="mt-4 max-w-md leading-relaxed text-ink-soft">
                Good morning, when it comes. Check out as you get up.
              </p>
              <PaperButton
                onClick={handleCheckOut}
                disabled={isLoading || cooldownRemaining > 0}
                className="mt-8"
              >
                <Sun size={16} />
                {cooldownRemaining > 0
                  ? `Check out in ${formatCooldownTime(cooldownRemaining)}`
                  : isLoading
                  ? "Ending…"
                  : "Check out"}
              </PaperButton>
            </>
          )}
        </div>

        <dl className="grid grid-cols-2 content-start gap-x-8 gap-y-10 border-t border-ink pt-6 lg:col-span-5 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-2">
          <PaperStat
            label="Average night"
            value={stats.averageDuration ? formatDuration(stats.averageDuration) : "—"}
          />
          <PaperStat label="Nights this week" value={stats.thisWeek} />
          <PaperStat
            label="Average quality"
            value={stats.averageQuality || "—"}
            unit={stats.averageQuality ? "/ 5" : undefined}
          />
          <PaperStat label="Nights logged" value={stats.totalEntries} />
        </dl>
      </section>

      {/* The week */}
      <section aria-labelledby="week-heading">
        <SectionHeading
          id="week-heading"
          kicker="The last seven nights"
          title={
            <>
              Hours slept, <span className="italic">night by night.</span>
            </>
          }
        />
        <div className="mt-10">
          <SleepChart sleepEntries={completedEntries} />
        </div>
      </section>

      {/* Recent nights */}
      <section aria-labelledby="nights-heading">
        <SectionHeading id="nights-heading" kicker="Recent nights" title="The log." />
        {displayEntries.length === 0 ? (
          <p className="mt-10 border-t border-ink py-12 text-center font-display text-2xl italic text-ink-faint">
            No nights logged yet. Check in tonight.
          </p>
        ) : (
          <ul className="mt-8 border-t border-ink">
            {displayEntries.map((entry) => {
              const quality = entry.quality || 3;
              return (
                <li
                  key={entry.id}
                  className="group grid grid-cols-[4.5rem_1fr_auto] items-start gap-x-4 border-b border-paper-rule py-4"
                >
                  <p className="pt-0.5 font-ledger text-[11px] uppercase leading-tight tracking-[0.1em] text-ink-faint">
                    <span className="block text-base tabular-nums text-ink">
                      {new Date(entry.date).toLocaleDateString("en-GB", { day: "2-digit" })}
                    </span>
                    {new Date(entry.date).toLocaleDateString("en-GB", { month: "short" })}
                  </p>
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                      <span className="font-display text-2xl leading-none">
                        {formatDuration(entry.duration || 0)}
                      </span>
                      <span className="font-ledger text-xs text-ink-soft">
                        {formatTime(entry.checkIn)} –{" "}
                        {entry.checkOut ? formatTime(entry.checkOut) : "…"}
                      </span>
                      <span
                        className="flex items-center gap-1"
                        aria-label={`Quality ${quality} of 5, ${qualityWords[quality]}`}
                        title={`${qualityWords[quality]} (${quality}/5)`}
                      >
                        {[1, 2, 3, 4, 5].map((i) => (
                          <span
                            key={i}
                            aria-hidden="true"
                            className={`h-2 w-2 rounded-full ${
                              i <= quality ? "bg-ink" : "border border-ink/30"
                            }`}
                          />
                        ))}
                      </span>
                    </p>
                    {entry.notes && (
                      <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">
                        {entry.notes}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() =>
                      setDeleteConfirmation({
                        isOpen: true,
                        entryId: entry.id,
                        entryDate: new Date(entry.date).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "long",
                        }),
                      })
                    }
                    className={`${paperIconButton} hover:text-clay sm:opacity-0 sm:focus-visible:opacity-100 sm:group-hover:opacity-100`}
                    aria-label="Delete this night"
                  >
                    <Trash2 size={15} />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <ConfirmationDialog
        isOpen={checkInConfirmation}
        onClose={() => setCheckInConfirmation(false)}
        onConfirm={handleCheckIn}
        title="Start tonight's session?"
        message="The clock starts now. Check out when you get up."
        confirmText="Start"
        cancelText="Not yet"
        type="info"
      />

      <PaperDialog
        open={isNotesModalOpen}
        onOpenChange={(open) => !open && setIsNotesModalOpen(false)}
        title="Good morning."
        description="How did you sleep? Your answer is saved with the night and copied to your journal."
      >
        <div className="space-y-6">
          <fieldset>
            <legend className={paperLabel}>Quality</legend>
            <div className="mt-3 grid grid-cols-5 border border-ink/25">
              {[1, 2, 3, 4, 5].map((rating) => (
                <label
                  key={rating}
                  className={`cursor-pointer py-2 text-center text-sm transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-clay ${
                    sleepQuality === rating
                      ? "bg-ink text-paper"
                      : "text-ink-soft hover:bg-ink/5"
                  }`}
                >
                  <input
                    type="radio"
                    name="sleep-quality"
                    value={rating}
                    checked={sleepQuality === rating}
                    onChange={() => setSleepQuality(rating as 1 | 2 | 3 | 4 | 5)}
                    className="sr-only"
                  />
                  <span className="block font-ledger text-base">{rating}</span>
                  <span className="block text-[11px]">{qualityWords[rating]}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div>
            <label htmlFor="sleep-notes" className={paperLabel}>
              Notes
            </label>
            <textarea
              id="sleep-notes"
              value={sleepNotes}
              onChange={(e) => setSleepNotes(e.target.value)}
              className={`${paperTextarea} mt-2 resize-none`}
              rows={3}
              placeholder="Anything worth remembering?"
            />
          </div>

          {notesError && (
            <p role="alert" className="border-l-2 border-clay bg-clay/10 px-3 py-2 text-sm text-[#8A4526]">
              {notesError}
            </p>
          )}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <PaperButton tone="quiet" onClick={() => setIsNotesModalOpen(false)}>
              Skip
            </PaperButton>
            <PaperButton
              onClick={handleSaveNotes}
              disabled={isLoading || isCreatingJournal}
            >
              {isCreatingJournal ? "Saving…" : "Save to journal"}
            </PaperButton>
          </div>
        </div>
      </PaperDialog>

      <ConfirmationDialog
        isOpen={deleteConfirmation.isOpen}
        onClose={closeDelete}
        onConfirm={() => {
          if (deleteConfirmation.entryId) {
            onDeleteSleepEntry(deleteConfirmation.entryId);
          }
        }}
        title="Delete this night?"
        message={`The entry for ${deleteConfirmation.entryDate} will be removed for good.`}
        confirmText="Delete"
        cancelText="Keep it"
      />
    </div>
  );
};

export default SleepTracker;
