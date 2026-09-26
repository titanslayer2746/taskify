import React, { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import type { JournalEditorProps } from "@/services/types";
import { PaperButton } from "./paper/PaperDialog";
import { paperChip, paperInput, paperLabel, paperSheet } from "@/lib/paper";

const MAX_TAGS = 7;

const JournalEditor: React.FC<JournalEditorProps> = ({
  entry,
  onSave,
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
    if (titleRef.current && !entry.title) titleRef.current.focus();
    else if (contentRef.current && entry.title) contentRef.current.focus();
  }, [entry.title, entry.content]);

  useEffect(() => {
    setHasChanges(
      title !== entry.title ||
        content !== entry.content ||
        JSON.stringify(tags) !== JSON.stringify(entry.tags || [])
    );
  }, [title, content, tags, entry.title, entry.content, entry.tags]);

  // Auto-save after 5 seconds without typing.
  useEffect(() => {
    if (!hasChanges) return;
    const autoSaveTimer = setTimeout(() => {
      if (!title.trim() && !content.trim()) return;
      setIsAutoSaving(true);
      const trimmedTitle = title.trim();
      const trimmedContent = content.trim();
      if (title !== trimmedTitle) setTitle(trimmedTitle);
      if (content !== trimmedContent) setContent(trimmedContent);
      onSave(entry.id, trimmedTitle, trimmedContent, false, tags);
      setTimeout(() => setIsAutoSaving(false), 1000);
    }, 5000);
    return () => clearTimeout(autoSaveTimer);
  }, [title, content, tags, hasChanges, entry.id, onSave]);

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    const newTag = tagInput.trim();
    if (newTag && tags.length < MAX_TAGS && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
    }
    setTagInput("");
  };

  const handleManualSave = async () => {
    if (!title.trim() && !content.trim()) return;
    setIsManualSaving(true);
    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();
    if (title !== trimmedTitle) setTitle(trimmedTitle);
    if (content !== trimmedContent) setContent(trimmedContent);
    try {
      await onSave(entry.id, trimmedTitle, trimmedContent, true, tags);
      setHasChanges(false);
    } catch (error) {
      console.error("Manual save failed:", error);
    } finally {
      setIsManualSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "s") {
      e.preventDefault();
      handleManualSave();
    }
  };

  const words = content.split(/\s+/).filter(Boolean).length;
  const status =
    isAutoSaving || isOptimistic || isManualSaving
      ? "Saving…"
      : hasChanges
      ? "Unsaved changes"
      : "All changes saved";

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4 flex flex-wrap items-center justify-end gap-4">
        <span
          className={`font-ledger text-[11px] uppercase tracking-[0.14em] ${
            hasChanges && !isAutoSaving ? "text-clay" : "text-ink-faint"
          }`}
          role="status"
        >
          {status}
        </span>
        <PaperButton
          onClick={handleManualSave}
          disabled={isManualSaving || isAutoSaving}
          title="Save (Ctrl/⌘ + S)"
        >
          Save
          <kbd className="hidden font-ledger text-[10px] opacity-60 sm:inline">⌘S</kbd>
        </PaperButton>
      </div>

      <article className={`relative ${paperSheet}`}>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-10 top-0 w-px bg-clay/40 sm:left-14"
        />
        <div className="relative py-10 pl-16 pr-6 sm:pl-24 sm:pr-12">
          <p className="font-ledger text-[11px] uppercase tracking-[0.16em] text-ink-faint">
            {new Date(entry.createdAt).toLocaleDateString("en-GB", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
          <label htmlFor="journal-title" className="sr-only">
            Title
          </label>
          <input
            id="journal-title"
            ref={titleRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="A title"
            className="mt-3 w-full border-0 bg-transparent p-0 font-display text-4xl leading-tight text-ink placeholder:text-ink-faint/60 focus:outline-none focus:ring-0 sm:text-5xl"
          />

          <label htmlFor="journal-content" className="sr-only">
            Entry
          </label>
          <textarea
            id="journal-content"
            ref={contentRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Start writing…"
            className="paper-ruled mt-6 min-h-[28rem] w-full resize-y border-0 bg-transparent p-0 text-[17px] leading-8 text-ink placeholder:text-ink-faint/60 focus:outline-none focus:ring-0"
            style={{ backgroundAttachment: "local" }}
          />

          <div className="mt-8 border-t border-ink/15 pt-6">
            <label htmlFor="journal-tags" className={paperLabel}>
              Tags · {tags.length}/{MAX_TAGS}
            </label>
            <input
              id="journal-tags"
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              className={paperInput}
              placeholder={
                tags.length >= MAX_TAGS ? "That's the limit" : "Type a tag and press Enter"
              }
              disabled={tags.length >= MAX_TAGS}
            />
            {tags.length > 0 && (
              <ul className="mt-3 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <li key={tag} className={paperChip}>
                    #{tag}
                    <button
                      type="button"
                      onClick={() => setTags(tags.filter((t) => t !== tag))}
                      aria-label={`Remove tag ${tag}`}
                      className="paper-focus -mr-1 hover:text-clay"
                    >
                      <X size={12} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <p className="mt-8 font-ledger text-[11px] text-ink-faint">
            {words} {words === 1 ? "word" : "words"} · {content.length} characters
          </p>
        </div>
      </article>
    </div>
  );
};

export default JournalEditor;
