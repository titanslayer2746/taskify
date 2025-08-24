import React, { useState, useEffect, useRef } from "react";
import { BookOpen, AlertTriangle, X, Loader2, Save } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { JournalEntry } from "@/services/types";

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
  isOptimistic?: boolean;
}

const JournalEditor: React.FC<JournalEditorProps> = ({
  entry,
  onSave,
  onClose,
  isOptimistic = false,
}) => {
  const [title, setTitle] = useState(entry.title);
  const [content, setContent] = useState(entry.content);
  const [tags, setTags] = useState<string[]>(entry.tags || []);
  const [tagInput, setTagInput] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [isManualSaving, setIsManualSaving] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Focus on title input when component mounts
    if (titleRef.current && !entry.title) {
      titleRef.current.focus();
    } else if (contentRef.current && entry.title) {
      contentRef.current.focus();
    }
  }, [entry.title, entry.content]);

  useEffect(() => {
    const hasTitleChanged = title !== entry.title;
    const hasContentChanged = content !== entry.content;
    const hasTagsChanged =
      JSON.stringify(tags) !== JSON.stringify(entry.tags || []);
    setHasChanges(hasTitleChanged || hasContentChanged || hasTagsChanged);
  }, [title, content, tags, entry.title, entry.content, entry.tags]);

  // Auto-save functionality
  useEffect(() => {
    if (hasChanges) {
      const autoSaveTimer = setTimeout(() => {
        if (title.trim() || content.trim()) {
          setIsAutoSaving(true);

          // Trim the values and update local state to prevent continuous auto-save
          const trimmedTitle = title.trim();
          const trimmedContent = content.trim();

          // Update local state with trimmed values
          if (title !== trimmedTitle) setTitle(trimmedTitle);
          if (content !== trimmedContent) setContent(trimmedContent);

          onSave(entry.id, trimmedTitle, trimmedContent, false, tags); // Auto-save

          setTimeout(() => {
            setIsAutoSaving(false);
          }, 1000);
        }
      }, 5000); // Auto-save after 5 seconds of no typing

      return () => clearTimeout(autoSaveTimer);
    }
  }, [title, content, tags, hasChanges, entry.id, onSave]);

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

  const handleManualSave = async () => {
    if (title.trim() || content.trim()) {
      setIsManualSaving(true);

      // Trim the values
      const trimmedTitle = title.trim();
      const trimmedContent = content.trim();

      // Update local state with trimmed values
      if (title !== trimmedTitle) setTitle(trimmedTitle);
      if (content !== trimmedContent) setContent(trimmedContent);

      try {
        await onSave(entry.id, trimmedTitle, trimmedContent, true, tags); // Manual save
        setHasChanges(false);
      } catch (error) {
        console.error("Manual save failed:", error);
      } finally {
        setIsManualSaving(false);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Save on Ctrl/Cmd + S
    if ((e.ctrlKey || e.metaKey) && e.key === "s") {
      e.preventDefault();
      handleManualSave();
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
              {isAutoSaving && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium"
                >
                  Auto-saving...
                </motion.div>
              )}

              <button
                onClick={handleManualSave}
                disabled={isManualSaving || isAutoSaving}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-green-500/25 focus:outline-none focus:ring-4 focus:ring-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isManualSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {isManualSaving ? "Saving..." : "Save"}
              </button>
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
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter your journal title..."
              className="w-full bg-transparent text-2xl font-bold text-white placeholder-gray-500 focus:outline-none focus:ring-0 border-none"
            />
          </div>

          {/* Content Editor */}
          <div className="p-6">
            <textarea
              ref={contentRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Start writing your thoughts, ideas, and experiences..."
              className="w-full h-96 bg-transparent text-white placeholder-gray-500 focus:outline-none focus:ring-0 border-none resize-none leading-relaxed"
              style={{ fontFamily: "inherit" }}
            />
          </div>

          {/* Tags Section */}
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
                disabled={tags.length >= 7}
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
                {isOptimistic && (
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Saving...
                  </span>
                )}
                <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">
                  {isAutoSaving
                    ? "Auto-saving..."
                    : hasChanges
                    ? "Unsaved changes"
                    : "All changes saved"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default JournalEditor;
