import React, { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import type {
  CreateTodoModalProps,
  Todo,
  TodoListProps,
} from "@/services/types";
import PaperDialog, { PaperButton } from "./paper/PaperDialog";
import {
  paperIconButton,
  paperInput,
  paperLabel,
  paperSelect,
  paperTextarea,
} from "@/lib/paper";

type Filter = "all" | "active" | "completed";
type SortBy = "priority" | "dueDate" | "createdAt";

const filterLabels: Record<Filter, string> = {
  all: "All",
  active: "Open",
  completed: "Done",
};

const priorityOrder = { high: 3, medium: 2, low: 1 } as const;

const PriorityMark: React.FC<{ priority: Todo["priority"] }> = ({ priority }) => (
  <span
    className={`font-ledger text-[10px] uppercase tracking-[0.14em] ${
      priority === "high"
        ? "text-clay"
        : priority === "medium"
        ? "text-ink-soft"
        : "text-ink-faint"
    }`}
    title={`${priority} priority`}
  >
    {priority === "high" ? "!!! " : priority === "medium" ? "!! " : "! "}
    {priority}
  </span>
);

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
};

const isOverdue = (dueDate: string) =>
  new Date(dueDate) < new Date() &&
  new Date(dueDate).toDateString() !== new Date().toDateString();

const TodoList: React.FC<TodoListProps> = ({
  todos,
  onToggleTodo,
  onCreateTodo,
  onDeleteClick,
}) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const [sortBy, setSortBy] = useState<SortBy>("priority");
  const [expandedTodos, setExpandedTodos] = useState<Set<string>>(new Set());
  const [quickTitle, setQuickTitle] = useState("");

  const filteredTodos = useMemo(() => {
    const filtered = todos.filter((todo) =>
      filter === "active"
        ? !todo.completed
        : filter === "completed"
        ? todo.completed
        : true
    );

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "priority":
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case "dueDate":
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case "createdAt":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        default:
          return 0;
      }
    });
  }, [todos, filter, sortBy]);

  const toggleExpanded = (todoId: string) => {
    setExpandedTodos((prev) => {
      const next = new Set(prev);
      if (next.has(todoId)) next.delete(todoId);
      else next.add(todoId);
      return next;
    });
  };

  const completedCount = todos.filter((todo) => todo.completed).length;
  const totalCount = todos.length;
  const counts: Record<Filter, number> = {
    all: totalCount,
    active: totalCount - completedCount,
    completed: completedCount,
  };

  const quickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;
    onCreateTodo({
      title: quickTitle.trim(),
      completed: false,
      priority: "medium",
    });
    setQuickTitle("");
  };

  return (
    <div className="mt-10">
      {/* Quick add */}
      <form onSubmit={quickAdd} className="flex items-end gap-3">
        <label htmlFor="quick-task" className="sr-only">
          New task
        </label>
        <input
          id="quick-task"
          value={quickTitle}
          onChange={(e) => setQuickTitle(e.target.value)}
          placeholder="Write a task and press Enter…"
          maxLength={100}
          className={`${paperInput} py-3 font-display text-2xl sm:text-3xl`}
        />
        <PaperButton
          type="button"
          tone="quiet"
          onClick={() => setIsCreateModalOpen(true)}
          className="shrink-0 whitespace-nowrap"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">With details</span>
        </PaperButton>
      </form>

      {/* Toolbar */}
      <div className="mt-10 flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
        <div role="tablist" aria-label="Filter tasks" className="flex gap-6">
          {(Object.keys(filterLabels) as Filter[]).map((option) => (
            <button
              key={option}
              role="tab"
              aria-selected={filter === option}
              onClick={() => setFilter(option)}
              className={`paper-focus relative pb-1 text-[15px] transition-colors ${
                filter === option
                  ? "text-ink after:absolute after:inset-x-0 after:-bottom-px after:h-[2px] after:bg-clay"
                  : "text-ink-soft hover:text-ink"
              }`}
            >
              {filterLabels[option]}
              <span className="ml-1.5 font-ledger text-[11px] text-ink-faint">
                {counts[option]}
              </span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3" aria-label="Progress">
            <span className="font-ledger text-[11px] uppercase tracking-[0.14em] text-ink-faint">
              {completedCount}/{totalCount} done
            </span>
            <span className="h-[3px] w-20 bg-ink/10">
              <span
                className="block h-full bg-ink transition-all duration-300"
                style={{
                  width: `${totalCount ? (completedCount / totalCount) * 100 : 0}%`,
                }}
              />
            </span>
          </div>
          <label className="flex items-center gap-2">
            <span className="sr-only">Sort by</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className={`${paperSelect} w-auto py-1 text-[15px]`}
            >
              <option value="priority">By priority</option>
              <option value="dueDate">By due date</option>
              <option value="createdAt">Newest first</option>
            </select>
          </label>
        </div>
      </div>

      {/* List */}
      <ul className="mt-3 border-t border-ink">
        {filteredTodos.length === 0 ? (
          <li className="py-16 text-center">
            <p className="font-display text-3xl italic text-ink-soft">
              {filter === "all"
                ? "Nothing on the list."
                : filter === "active"
                ? "Nothing left to do."
                : "Nothing crossed off yet."}
            </p>
            <p className="mt-2 text-ink-faint">
              {filter === "all"
                ? "Write your first task above."
                : filter === "active"
                ? "Every task is done."
                : "Tick a task and it shows up here."}
            </p>
          </li>
        ) : (
          filteredTodos.map((todo) => {
            const overdue =
              !!todo.dueDate && isOverdue(todo.dueDate) && !todo.completed;
            const expanded = expandedTodos.has(todo.id);
            const pending = todo.id.startsWith("temp-");
            return (
              <li
                key={todo.id}
                className={`group flex items-start gap-4 border-b border-paper-rule py-4 transition-opacity ${
                  pending ? "opacity-60" : ""
                }`}
              >
                <button
                  onClick={() => onToggleTodo(todo.id)}
                  disabled={pending}
                  aria-pressed={todo.completed}
                  aria-label={`${todo.completed ? "Reopen" : "Complete"} “${todo.title}”`}
                  className={`paper-focus mt-1 grid h-5 w-5 shrink-0 place-items-center border-[1.5px] transition-colors ${
                    todo.completed
                      ? "border-ink bg-ink"
                      : "border-ink/60 hover:border-ink hover:bg-ink/5"
                  }`}
                >
                  {todo.completed && (
                    <svg viewBox="0 0 10 10" className="h-3 w-3 text-paper">
                      <path
                        d="M1.5 5.5l2.2 2.2L8.5 2.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />
                    </svg>
                  )}
                </button>

                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-4">
                    <p
                      className={`text-lg leading-snug ${
                        todo.completed
                          ? "text-ink-faint line-through decoration-clay decoration-[1.5px]"
                          : "text-ink"
                      }`}
                    >
                      {todo.title}
                    </p>
                    <span className="hidden shrink-0 sm:block">
                      <PriorityMark priority={todo.priority} />
                    </span>
                  </div>

                  {todo.description && (
                    <button
                      onClick={() => toggleExpanded(todo.id)}
                      aria-expanded={expanded}
                      className={`paper-focus mt-1 block text-left text-[15px] leading-relaxed text-ink-soft ${
                        expanded ? "" : "line-clamp-2"
                      } ${todo.completed ? "text-ink-faint" : ""}`}
                    >
                      {todo.description}
                    </button>
                  )}

                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 font-ledger text-[11px] text-ink-faint">
                    <span className="sm:hidden">
                      <PriorityMark priority={todo.priority} />
                    </span>
                    {todo.dueDate && (
                      <span className={overdue ? "text-clay" : ""}>
                        {overdue ? "Overdue · " : "Due "}
                        {formatDate(todo.dueDate)}
                      </span>
                    )}
                    <span>Added {formatDate(todo.createdAt)}</span>
                  </div>
                </div>

                <button
                  onClick={() => onDeleteClick(todo.id, todo.title)}
                  disabled={pending}
                  aria-label={`Delete “${todo.title}”`}
                  className={`${paperIconButton} hover:text-clay sm:opacity-0 sm:focus-visible:opacity-100 sm:group-hover:opacity-100`}
                >
                  <Trash2 size={16} />
                </button>
              </li>
            );
          })
        )}
      </ul>

      <CreateTodoModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onConfirm={onCreateTodo}
      />
    </div>
  );
};

const CreateTodoModal: React.FC<CreateTodoModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [dueDate, setDueDate] = useState("");

  const reset = () => {
    setTitle("");
    setDescription("");
    setPriority("medium");
    setDueDate("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onConfirm({
      title: title.trim(),
      description: description.trim() || undefined,
      completed: false,
      priority,
      dueDate: dueDate || undefined,
      category: undefined,
    });
    reset();
    onClose();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <PaperDialog
      open={isOpen}
      onOpenChange={(open) => !open && handleClose()}
      title="A new task"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="todo-title" className={paperLabel}>
            Title
          </label>
          <input
            id="todo-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs doing?"
            className={`${paperInput} text-lg`}
            maxLength={100}
            autoFocus
            required
          />
        </div>

        <div>
          <label htmlFor="todo-description" className={paperLabel}>
            Notes
          </label>
          <textarea
            id="todo-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional"
            rows={3}
            className={`${paperTextarea} mt-2 resize-none`}
            maxLength={500}
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <fieldset>
            <legend className={paperLabel}>Priority</legend>
            <div className="mt-2 grid grid-cols-3 border border-ink/25">
              {(["low", "medium", "high"] as const).map((option) => (
                <label
                  key={option}
                  className={`cursor-pointer py-1.5 text-center text-sm capitalize transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-clay ${
                    priority === option
                      ? "bg-ink text-paper"
                      : "text-ink-soft hover:bg-ink/5"
                  }`}
                >
                  <input
                    type="radio"
                    name="priority"
                    value={option}
                    checked={priority === option}
                    onChange={() => setPriority(option)}
                    className="sr-only"
                  />
                  {option}
                </label>
              ))}
            </div>
          </fieldset>

          <div>
            <label htmlFor="todo-due" className={paperLabel}>
              Due
            </label>
            <input
              id="todo-due"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className={paperInput}
            />
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <PaperButton type="button" tone="quiet" onClick={handleClose}>
            Cancel
          </PaperButton>
          <PaperButton type="submit" disabled={!title.trim()}>
            Add task
          </PaperButton>
        </div>
      </form>
    </PaperDialog>
  );
};

export default TodoList;
