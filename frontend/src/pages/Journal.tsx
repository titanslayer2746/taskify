import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PaperNavbar from "../components/paper/PaperNavbar";
import PaperPage, {
  PaperBanner,
  PaperEmpty,
  PaperErrorState,
  PaperLoading,
} from "../components/paper/PaperPage";
import { PaperButton } from "../components/paper/PaperDialog";
import { paperInput, todayDateline } from "@/lib/paper";
import JournalCard from "../components/JournalCard";
import JournalEditor from "../components/JournalEditor";
import { ArrowLeft, Plus, Search, X } from "lucide-react";
import { apiService } from "@/services/api";
import { JournalEntry } from "@/services/types";
import { useAuth } from "@/contexts/AuthContext";

const Journal = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<JournalEntry | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [optimisticUpdates, setOptimisticUpdates] = useState<Map<string, any>>(
    new Map()
  );
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Fetch journal entries from API
  const fetchEntries = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiService.getJournalEntries();

      if (response.success && response.data) {
        // Handle both paginated and non-paginated responses
        const entries =
          "entries" in response.data
            ? response.data.entries
            : response.data.data;
        setEntries(entries);
      } else {
        setError(response.message || "Failed to fetch journal entries");
      }
    } catch (error: any) {
      console.error("Error fetching journal entries:", error);
      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch journal entries. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Load entries on component mount
  useEffect(() => {
    if (user) {
      fetchEntries();
    }
  }, [user]);

  useEffect(() => {
    // Wait for entries before deciding a deep-linked entry doesn't exist.
    if (isLoading) return;
    if (id) {
      const entry = entries.find((e) => e.id === id);
      if (entry) {
        setCurrentEntry(entry);
        setIsEditorOpen(true);
      } else {
        navigate("/journal");
      }
    } else {
      setCurrentEntry(null);
      setIsEditorOpen(false);
    }
  }, [id, entries, navigate, isLoading]);

  // Filter entries based on search query
  const filteredEntries = useMemo(() => {
    if (!searchQuery.trim()) return entries;

    const query = searchQuery.toLowerCase();
    return entries.filter((entry) => {
      // Search in title
      if (entry.title.toLowerCase().includes(query)) return true;

      // Search in content
      if (entry.content.toLowerCase().includes(query)) return true;

      // Search in tags
      if (
        entry.tags &&
        entry.tags.some((tag) => tag.toLowerCase().includes(query))
      )
        return true;

      return false;
    });
  }, [entries, searchQuery]);

  // Create new entry with optimistic update
  const createNewEntry = async () => {
    try {
      setIsCreating(true);
      setError(null);

      // Create optimistic entry
      const optimisticEntry: JournalEntry = {
        id: `temp-${Date.now()}`,
        title: todayDateline(),
        content: "",
        tags: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Add optimistic update
      setOptimisticUpdates(
        (prev) => new Map(prev.set(optimisticEntry.id, optimisticEntry))
      );
      setEntries((prev) => [optimisticEntry, ...prev]);

      // Make API call
      const response = await apiService.createJournalEntry({
        title: optimisticEntry.title,
        content: "",
        tags: [],
      });

      if (response.success && response.data) {
        // Replace optimistic entry with real one
        setEntries((prev) =>
          prev.map((entry) =>
            entry.id === optimisticEntry.id ? response.data.entry : entry
          )
        );
        navigate(`/journal/${response.data.entry.id}`);
      } else {
        // Remove optimistic update on error
        setEntries((prev) =>
          prev.filter((entry) => entry.id !== optimisticEntry.id)
        );
        setError(response.message || "Failed to create journal entry");
      }
    } catch (error: any) {
      console.error("Error creating journal entry:", error);

      // Remove optimistic update on error
      setEntries((prev) =>
        prev.filter((entry) => !entry.id.startsWith("temp-"))
      );
      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to create journal entry. Please try again."
      );
    } finally {
      setIsCreating(false);
      setOptimisticUpdates((prev) => {
        const newMap = new Map(prev);
        newMap.clear();
        return newMap;
      });
    }
  };

  // Save entry with optimistic update
  const saveEntry = async (
    id: string,
    title: string,
    content: string,
    isExplicitSave: boolean = false,
    tags: string[] = []
  ) => {
    try {
      // Create optimistic update
      const optimisticEntry = entries.find((e) => e.id === id);
      if (!optimisticEntry) return;

      const updatedEntry = {
        ...optimisticEntry,
        title,
        content,
        tags,
        updatedAt: isExplicitSave
          ? new Date().toISOString()
          : optimisticEntry.updatedAt,
      };

      // Apply optimistic update
      setOptimisticUpdates((prev) => new Map(prev.set(id, updatedEntry)));
      setEntries((prev) =>
        prev.map((entry) => {
          if (entry.id === id) {
            return updatedEntry;
          }
          return entry;
        })
      );

      // Make API call
      const response = await apiService.updateJournalEntry(id, {
        title,
        content,
        tags,
        isExplicitSave,
      });

      if (response.success && response.data) {
        // Replace with real data
        setEntries((prev) =>
          prev.map((entry) => {
            if (entry.id === id) {
              return response.data.entry;
            }
            return entry;
          })
        );
      } else {
        // Revert optimistic update on error
        setEntries((prev) =>
          prev.map((entry) => {
            if (entry.id === id) {
              return optimisticEntry;
            }
            return entry;
          })
        );
        setError(response.message || "Failed to save journal entry");
      }
    } catch (error: any) {
      console.error("Error saving journal entry:", error);

      // Revert optimistic update on error
      const originalEntry = entries.find((e) => e.id === id);
      if (originalEntry) {
        setEntries((prev) =>
          prev.map((entry) => {
            if (entry.id === id) {
              return originalEntry;
            }
            return entry;
          })
        );
      }
      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to save journal entry. Please try again."
      );
    } finally {
      setOptimisticUpdates((prev) => {
        const newMap = new Map(prev);
        newMap.delete(id);
        return newMap;
      });
    }
  };

  // Delete entry with optimistic update
  const deleteEntry = async (id: string) => {
    try {
      // Store original entry for rollback
      const originalEntry = entries.find((e) => e.id === id);
      if (!originalEntry) return;

      // Apply optimistic update
      setOptimisticUpdates((prev) => new Map(prev.set(id, null)));
      setEntries((prev) => prev.filter((entry) => entry.id !== id));

      if (currentEntry?.id === id) {
        navigate("/journal");
      }

      // Make API call
      const response = await apiService.deleteJournalEntry(id);

      if (!response.success) {
        // Revert optimistic update on error
        setEntries((prev) => [...prev, originalEntry]);
        setError(response.message || "Failed to delete journal entry");
      }
    } catch (error: any) {
      console.error("Error deleting journal entry:", error);

      // Revert optimistic update on error
      const originalEntry = entries.find((e) => e.id === id);
      if (originalEntry) {
        setEntries((prev) => [...prev, originalEntry]);
      }
      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to delete journal entry. Please try again."
      );
    } finally {
      setOptimisticUpdates((prev) => {
        const newMap = new Map(prev);
        newMap.delete(id);
        return newMap;
      });
    }
  };

  const closeEditor = () => {
    setIsEditorOpen(false);
    setCurrentEntry(null);
    navigate("/journal");
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  // Group the index by month, newest first.
  const entriesByMonth = useMemo(() => {
    const groups: { label: string; entries: JournalEntry[] }[] = [];
    for (const entry of filteredEntries) {
      const label = new Date(entry.createdAt).toLocaleDateString("en-GB", {
        month: "long",
        year: "numeric",
      });
      const last = groups[groups.length - 1];
      if (last && last.label === label) last.entries.push(entry);
      else groups.push({ label, entries: [entry] });
    }
    return groups;
  }, [filteredEntries]);

  const newEntryButton = (
    <PaperButton onClick={createNewEntry} disabled={isCreating}>
      <Plus size={16} />
      {isCreating ? "Opening a page…" : "New entry"}
    </PaperButton>
  );

  if (isLoading) {
    return (
      <PaperPage number="08" title="Journal" width="narrow">
        <PaperLoading label="Opening your journal…" />
      </PaperPage>
    );
  }

  if (error && entries.length === 0) {
    return (
      <PaperPage number="08" title="Journal" width="narrow">
        <PaperErrorState message={error} onRetry={fetchEntries} />
      </PaperPage>
    );
  }

  if (isEditorOpen && currentEntry) {
    return (
      <div className="paper-grain min-h-screen font-paper text-ink antialiased selection:bg-clay/20">
        <PaperNavbar />
        <main className="mx-auto max-w-4xl px-4 pb-24 pt-8 sm:px-6">
          <button
            onClick={closeEditor}
            className="paper-focus inline-flex items-center gap-2 font-ledger text-[11px] uppercase tracking-[0.16em] text-ink-soft hover:text-ink"
          >
            <ArrowLeft size={14} />
            All entries
          </button>
          {error && <PaperBanner message={error} onDismiss={() => setError(null)} />}
          <div className="mt-6">
            <JournalEditor
              entry={currentEntry}
              onSave={saveEntry}
              isOptimistic={optimisticUpdates.has(currentEntry.id)}
            />
          </div>
        </main>
      </div>
    );
  }

  return (
    <PaperPage
      number="08"
      title="Journal"
      subtitle="Write it down, read it back."
      width="narrow"
      actions={entries.length > 0 ? newEntryButton : undefined}
    >
      {error && <PaperBanner message={error} onDismiss={() => setError(null)} />}

      {entries.length === 0 ? (
        <PaperEmpty
          title="A blank journal."
          body="Nothing written yet. A line or two about today is plenty to start."
          action={newEntryButton}
        />
      ) : (
        <>
          <label className="relative mt-10 block">
            <span className="sr-only">Search the journal</span>
            <Search
              size={18}
              className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 text-ink-faint"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search titles, pages and tags"
              className={`${paperInput} py-3 pl-8 pr-8 text-lg`}
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                aria-label="Clear search"
                className="paper-focus absolute right-0 top-1/2 -translate-y-1/2 p-1 text-ink-faint hover:text-ink"
              >
                <X size={16} />
              </button>
            )}
          </label>

          {filteredEntries.length === 0 ? (
            <p className="py-16 text-center font-display text-2xl italic text-ink-faint">
              Nothing matches “{searchQuery}”.
            </p>
          ) : (
            entriesByMonth.map((group) => (
              <section key={group.label} className="mt-14">
                <h2 className="border-b border-ink pb-2 font-ledger text-[11px] uppercase tracking-[0.18em] text-ink">
                  {group.label}
                  <span className="ml-2 text-ink-faint">{group.entries.length}</span>
                </h2>
                <ul>
                  {group.entries.map((entry) => (
                    <JournalCard
                      key={entry.id}
                      entry={entry}
                      onDelete={deleteEntry}
                      onView={() => navigate(`/journal/${entry.id}`)}
                      isOptimistic={optimisticUpdates.has(entry.id)}
                    />
                  ))}
                </ul>
              </section>
            ))
          )}
        </>
      )}
    </PaperPage>
  );
};

export default Journal;
