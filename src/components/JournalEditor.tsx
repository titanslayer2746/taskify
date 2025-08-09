import React, { useState, useEffect, useRef } from "react";
import { Lock, BookOpen, AlertTriangle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

interface JournalEditorProps {
  entry: JournalEntry;
  onSave: (
    id: string,
    title: string,
    content: string,
    isExplicitSave?: boolean,
    tags?: string[]
  ) => void;
  onClose: () => void;
}

const JournalEditor: React.FC<JournalEditorProps> = ({
  entry,
  onSave,
  onClose,
}) => {
  const [title, setTitle] = useState(entry.title);
  const [content, setContent] = useState(entry.content);
  const [tags, setTags] = useState<string[]>(entry.tags || []);
  const [tagInput, setTagInput] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [showLockConfirm, setShowLockConfirm] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Check if entry has been saved before (has title or content) AND was explicitly saved
    const hasBeenExplicitlySaved =
      Boolean(entry.title.trim() || entry.content.trim()) &&
      entry.updatedAt !== entry.createdAt;
    setIsReadOnly(hasBeenExplicitlySaved);

    // Focus on title input when component mounts
    if (titleRef.current && !entry.title) {
      titleRef.current.focus();
    } else if (contentRef.current && entry.title) {
      contentRef.current.focus();
    }
  }, [entry.title, entry.content, entry.updatedAt, entry.createdAt]);

  useEffect(() => {
    const hasTitleChanged = title !== entry.title;
    const hasContentChanged = content !== entry.content;
    const hasTagsChanged =
      JSON.stringify(tags) !== JSON.stringify(entry.tags || []);
    setHasChanges(hasTitleChanged || hasContentChanged || hasTagsChanged);
  }, [title, content, tags, entry.title, entry.content, entry.tags]);

  // Auto-save functionality
  useEffect(() => {
    if (hasChanges && !isReadOnly) {
      const autoSaveTimer = setTimeout(() => {
        if (title.trim() || content.trim()) {
          setIsAutoSaving(true);
          onSave(entry.id, title.trim(), content.trim(), false, tags); // Auto-save
          setTimeout(() => {
            setIsAutoSaving(false);
          }, 1000);
        }
      }, 2000); // Auto-save after 2 seconds of no typing

      return () => clearTimeout(autoSaveTimer);
    }
  }, [title, content, tags, hasChanges, isReadOnly, entry.id, onSave]);

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim() && tags.length < 7) {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (!tags.includes(newTag)) {
        setTags([...tags, newTag]);
        setTagInput("");
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleLockClick = () => {
    setShowLockConfirm(true);
  };

  const handleConfirmLock = () => {
    if (title.trim() || content.trim()) {
      onSave(entry.id, title.trim(), content.trim(), true, tags); // Explicit save
      setHasChanges(false);
      setIsReadOnly(true); // Lock the journal for read-only
      setShowLockConfirm(false);
    }
  };

  const handleCancelLock = () => {
    setShowLockConfirm(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Lock on Ctrl/Cmd + L (only if not read-only)
    if (!isReadOnly && (e.ctrlKey || e.metaKey) && e.key === "l") {
      e.preventDefault();
      handleLockClick();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTitle = () => {
    return title.trim() || "Untitled Entry";
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-6 border border-gray-700/30 backdrop-blur-sm mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-yellow-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Journal Editor
                </h2>
                <p className="text-gray-400 text-sm">
                  Created {formatDate(entry.createdAt)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {isReadOnly && (
                <div className="flex items-center gap-2 px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm font-medium">
                  <Lock size={14} />
                  Locked
                </div>
              )}

              {isAutoSaving && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium"
                >
                  Auto-saving...
                </motion.div>
              )}

              {!isReadOnly && (
                <button
                  onClick={handleLockClick}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-600 to-amber-600 rounded-lg font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-yellow-500/25 focus:outline-none focus:ring-4 focus:ring-yellow-500/50"
                >
                  <Lock size={16} />
                  Lock Journal
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Editor */}
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/30 backdrop-blur-sm overflow-hidden">
          {/* Title Input */}
          <div className="p-6 border-b border-gray-700/30">
            <input
              ref={titleRef}
              type="text"
              value={title}
              onChange={(e) => !isReadOnly && setTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter your journal title..."
              disabled={isReadOnly}
              className="w-full bg-transparent text-2xl font-bold text-white placeholder-gray-500 focus:outline-none focus:ring-0 border-none disabled:opacity-75 disabled:cursor-not-allowed"
            />
          </div>

          {/* Content Editor */}
          <div className="p-6">
            <textarea
              ref={contentRef}
              value={content}
              onChange={(e) => !isReadOnly && setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Start writing your thoughts, ideas, and experiences..."
              disabled={isReadOnly}
              className="w-full h-96 bg-transparent text-white placeholder-gray-500 focus:outline-none focus:ring-0 border-none resize-none leading-relaxed disabled:opacity-75 disabled:cursor-not-allowed"
              style={{ fontFamily: "inherit" }}
            />
          </div>

          {/* Tags Section */}
          {!isReadOnly && (
            <div className="px-6 py-4 border-t border-gray-700/30 bg-gray-800/30">
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tags ({tags.length}/7)
                </label>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 transition-all duration-200 hover:bg-gray-600/50 hover:border-gray-500/50 shadow-sm focus:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder={
                    tags.length >= 7
                      ? "Maximum tags reached"
                      : "Type tag and press Enter..."
                  }
                  disabled={tags.length >= 7 || isReadOnly}
                />
              </div>

              {/* Tags Display */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-500/20 text-yellow-400 text-sm rounded-full border border-yellow-500/30 shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:text-red-400 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tags Display (Read-only) */}
          {isReadOnly && tags.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-700/30 bg-gray-800/30">
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-500/20 text-yellow-400 text-sm rounded-full border border-yellow-500/30"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-700/30 bg-gray-800/30">
            <div className="flex items-center justify-between text-sm text-gray-400">
              <div className="flex items-center gap-4">
                <span>{content.length} characters</span>
                <span>
                  {
                    content.split(/\s+/).filter((word) => word.length > 0)
                      .length
                  }{" "}
                  words
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">
                  {isReadOnly
                    ? "Locked"
                    : isAutoSaving
                    ? "Auto-saving..."
                    : hasChanges
                    ? "Unsaved changes"
                    : "All changes saved"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Keyboard shortcuts hint */}
        {!isReadOnly && (
          <div className="mt-4 text-center">
            <p className="text-gray-400 text-sm">
              💡 Tip: Use{" "}
              <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">
                Ctrl/Cmd + L
              </kbd>{" "}
              to lock quickly
            </p>
          </div>
        )}
      </motion.div>

      {/* Lock Confirmation Dialog */}
      <AnimatePresence>
        {showLockConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={handleCancelLock}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gradient-to-br from-gray-800/95 to-gray-900/95 rounded-2xl p-6 border border-gray-700/30 backdrop-blur-sm max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    Lock Journal Entry
                  </h3>
                  <p className="text-gray-400 text-sm">
                    This action cannot be undone
                  </p>
                </div>
              </div>

              <p className="text-gray-300 mb-6">
                Are you sure you want to lock "
                <span className="font-semibold text-white">{getTitle()}</span>"?
                This will make the journal entry read-only and you won't be able
                to edit it anymore.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={handleCancelLock}
                  className="flex-1 px-4 py-2 bg-gray-700/50 text-gray-300 rounded-lg font-medium transition-all duration-200 hover:bg-gray-600/50 hover:text-white focus:outline-none focus:ring-2 focus:ring-gray-500/50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmLock}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-yellow-600 to-amber-600 text-white rounded-lg font-medium transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-yellow-500/25 focus:outline-none focus:ring-4 focus:ring-yellow-500/50"
                >
                  Lock Entry
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default JournalEditor;
