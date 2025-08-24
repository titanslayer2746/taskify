import React, { useState, useEffect, useMemo } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import JournalCard from "../components/JournalCard";
import JournalEditor from "../components/JournalEditor";
import {
  Plus,
  BookOpen,
  ArrowLeft,
  Search,
  X,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
  }, [id, entries, navigate]);

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
        title: "Untitled Entry",
        content: "Start writing your thoughts here...",
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
        title: "Untitled Entry",
        content: "Start writing your thoughts here...",
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

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        <Navbar />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-yellow-400 mb-4" />
            <p className="text-gray-400">Loading your journal entries...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && entries.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        <Navbar />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Failed to load journal entries
            </h3>
            <p className="text-gray-400 text-center mb-6 max-w-md">{error}</p>
            <button
              onClick={fetchEntries}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-600 to-amber-600 rounded-lg font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-yellow-500/25"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isEditorOpen && currentEntry) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        <Navbar />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Error banner */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <span className="text-red-400">{error}</span>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-300 transition-colors"
              >
                ×
              </button>
            </div>
          )}

          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={closeEditor}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-600 to-amber-600 rounded-lg font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-yellow-500/25 focus:outline-none focus:ring-4 focus:ring-yellow-500/50"
            >
              <ArrowLeft size={18} />
              Back to Journals
            </button>
          </div>
          <JournalEditor
            entry={currentEntry}
            onSave={saveEntry}
            onClose={closeEditor}
            isOptimistic={optimisticUpdates.has(currentEntry.id)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <Navbar />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error banner */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <span className="text-red-400">{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-300 transition-colors"
            >
              ×
            </button>
          </div>
        )}

        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <div className="w-24 h-24 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-12 h-12 text-yellow-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4">
                Start Your Journaling Journey
              </h3>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">
                Begin writing your thoughts, ideas, and experiences. Your first
                journal entry is just a click away.
              </p>
              <button
                onClick={createNewEntry}
                disabled={isCreating}
                className="group relative px-8 py-4 bg-gradient-to-r from-yellow-600 via-amber-600 to-yellow-700 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-yellow-500/25 focus:outline-none focus:ring-4 focus:ring-yellow-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-600 via-amber-600 to-yellow-700 rounded-xl blur opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center gap-2">
                  {isCreating ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <Plus size={24} />
                  )}
                  {isCreating ? "Creating..." : "Create Your First Entry"}
                </div>
              </button>
            </motion.div>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-white">
                Your Journal Entries ({filteredEntries.length})
              </h2>
              <button
                onClick={createNewEntry}
                disabled={isCreating}
                className="group relative px-6 py-3 bg-gradient-to-r from-yellow-600 via-amber-600 to-yellow-700 rounded-lg font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-yellow-500/25 focus:outline-none focus:ring-4 focus:ring-yellow-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-600 via-amber-600 to-yellow-700 rounded-lg blur opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center gap-2">
                  {isCreating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus size={18} />
                  )}
                  {isCreating ? "Creating..." : "New Entry"}
                </div>
              </button>
            </div>

            {/* Search Bar */}
            <div className="mb-8">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by title, content, or tags..."
                  className="w-full pl-10 pr-10 py-3 bg-gray-800/50 border border-gray-700/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 transition-all duration-200 hover:bg-gray-700/50 hover:border-gray-600/50 shadow-sm focus:shadow-md"
                />
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <AnimatePresence>
                {filteredEntries.map((entry, index) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <JournalCard
                      entry={entry}
                      onDelete={deleteEntry}
                      onView={() => navigate(`/journal/${entry.id}`)}
                      isOptimistic={optimisticUpdates.has(entry.id)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {/* No results message */}
            {filteredEntries.length === 0 && searchQuery && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  No results found
                </h3>
                <p className="text-gray-400">
                  No journal entries match your search for "{searchQuery}"
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Journal;
