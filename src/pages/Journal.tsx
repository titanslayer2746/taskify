import React, { useState, useEffect, useMemo } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import JournalCard from "../components/JournalCard";
import JournalEditor from "../components/JournalEditor";
import { Plus, BookOpen, ArrowLeft, Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

const Journal = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<JournalEntry | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    const savedEntries = localStorage.getItem("journalEntries");
    if (savedEntries) {
      setEntries(JSON.parse(savedEntries));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("journalEntries", JSON.stringify(entries));
  }, [entries]);

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

  const createNewEntry = () => {
    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      title: "",
      content: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: [],
    };
    setEntries([newEntry, ...entries]);
    navigate(`/journal/${newEntry.id}`);
  };

  const saveEntry = (
    id: string,
    title: string,
    content: string,
    isExplicitSave: boolean = false,
    tags: string[] = []
  ) => {
    setEntries(
      entries.map((entry) => {
        if (entry.id === id) {
          return {
            ...entry,
            title,
            content,
            tags,
            updatedAt: isExplicitSave
              ? new Date().toISOString()
              : entry.updatedAt,
          };
        }
        return entry;
      })
    );
  };

  const deleteEntry = (id: string) => {
    setEntries(entries.filter((entry) => entry.id !== id));
    if (currentEntry?.id === id) {
      navigate("/journal");
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

  if (isEditorOpen && currentEntry) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        <Navbar />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <Navbar />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                className="group relative px-8 py-4 bg-gradient-to-r from-yellow-600 via-amber-600 to-yellow-700 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-yellow-500/25 focus:outline-none focus:ring-4 focus:ring-yellow-500/50"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-600 via-amber-600 to-yellow-700 rounded-xl blur opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center gap-2">
                  <Plus size={24} />
                  Create Your First Entry
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
                className="group relative px-6 py-3 bg-gradient-to-r from-yellow-600 via-amber-600 to-yellow-700 rounded-lg font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-yellow-500/25 focus:outline-none focus:ring-4 focus:ring-yellow-500/50"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-600 via-amber-600 to-yellow-700 rounded-lg blur opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center gap-2">
                  <Plus size={18} />
                  New Entry
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
