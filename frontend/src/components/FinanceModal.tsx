import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { FinanceModalProps } from "@/services/types";
import PaperDialog, { PaperButton } from "./paper/PaperDialog";
import { todayKey } from "@/lib/habits";
import {
  paperChip,
  paperInput,
  paperLabel,
  paperSelect,
  paperTextarea,
} from "@/lib/paper";

const incomeCategories = ["Salary", "Freelance", "Investment", "Business", "Other"];

const expenseCategories = [
  "Food & Dining",
  "Transportation",
  "Shopping",
  "Entertainment",
  "Healthcare",
  "Education",
  "Bills & Utilities",
  "Housing",
  "Other",
];

const MAX_TAGS = 7;

const FinanceModal: React.FC<FinanceModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  copyFrom,
}) => {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(todayKey());

  const currentCategories =
    type === "income" ? incomeCategories : expenseCategories;

  useEffect(() => {
    if (!isOpen) return;
    setTitle(copyFrom?.title ?? "");
    setAmount(copyFrom ? copyFrom.amount.toString() : "");
    setType(copyFrom?.type ?? "expense");
    setCategory(copyFrom?.category ?? "");
    setTags(copyFrom ? [...copyFrom.tags] : []);
    setTagInput("");
    setDescription(copyFrom?.description ?? "");
    setDate(todayKey()); // a copy is logged for today
  }, [isOpen, copyFrom]);

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    const newTag = tagInput.trim();
    if (newTag && tags.length < MAX_TAGS && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
    }
    setTagInput("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!title.trim() || !category || isNaN(numAmount) || numAmount <= 0) return;

    onConfirm({
      title: title.trim(),
      amount: numAmount,
      type,
      category,
      tags,
      date,
      description: description.trim() || undefined,
    });
  };

  return (
    <PaperDialog
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      title={copyFrom ? "Log it again" : "A new entry"}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <fieldset>
          <legend className="sr-only">Type</legend>
          <div className="grid grid-cols-2 border border-ink/25">
            {(["expense", "income"] as const).map((entryType) => (
              <label
                key={entryType}
                className={`cursor-pointer py-2 text-center text-[15px] transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-clay ${
                  type === entryType ? "bg-ink text-paper" : "text-ink-soft hover:bg-ink/5"
                }`}
              >
                <input
                  type="radio"
                  name="entry-type"
                  value={entryType}
                  checked={type === entryType}
                  onChange={() => {
                    setType(entryType);
                    setCategory("");
                  }}
                  className="sr-only"
                />
                {entryType === "expense" ? "Money out" : "Money in"}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="grid gap-6 sm:grid-cols-[1fr_10rem]">
          <div>
            <label htmlFor="entry-title" className={paperLabel}>
              What for
            </label>
            <input
              id="entry-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`${paperInput} text-lg`}
              placeholder={type === "expense" ? "Groceries" : "September salary"}
              required
              autoFocus
            />
          </div>
          <div>
            <label htmlFor="entry-amount" className={paperLabel}>
              Amount (₹)
            </label>
            <input
              id="entry-amount"
              type="number"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={`${paperInput} text-right font-ledger text-lg tabular-nums`}
              placeholder="0"
              min="0"
              step="0.01"
              required
            />
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="entry-category" className={paperLabel}>
              Category
            </label>
            <select
              id="entry-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={paperSelect}
              required
            >
              <option value="">Choose…</option>
              {currentCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="entry-date" className={paperLabel}>
              Date
            </label>
            <input
              id="entry-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={paperInput}
            />
          </div>
        </div>

        <div>
          <label htmlFor="entry-tags" className={paperLabel}>
            Tags · {tags.length}/{MAX_TAGS}
          </label>
          <input
            id="entry-tags"
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

        <div>
          <label htmlFor="entry-notes" className={paperLabel}>
            Notes
          </label>
          <textarea
            id="entry-notes"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className={`${paperTextarea} mt-2 resize-none`}
            placeholder="Optional"
          />
        </div>

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <PaperButton type="button" tone="quiet" onClick={onClose}>
            Cancel
          </PaperButton>
          <PaperButton type="submit">
            {copyFrom ? "Log again" : "Add entry"}
          </PaperButton>
        </div>
      </form>
    </PaperDialog>
  );
};

export default FinanceModal;
