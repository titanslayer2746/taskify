import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Trash2,
  CheckCircle,
  Circle,
  Plus,
  X,
  Calendar,
  Clock,
  Star,
  MoreVertical,
  Edit3,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ConfirmationDialog from "./ConfirmationDialog";

interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
  dueDate?: string;
  createdAt: string;
  category?: string;
}

interface TodoListProps {
  todos: Todo[];
  onToggleTodo: (todoId: string) => void;
  onDeleteTodo: (todoId: string) => void;
  onEditTodo: (todoId: string, updates: Partial<Todo>) => void;
  onCreateTodo: (todo: Omit<Todo, "id" | "createdAt">) => void;
}

const TodoList: React.FC<TodoListProps> = ({
  todos,
  onToggleTodo,
  onDeleteTodo,
  onEditTodo,
  onCreateTodo,
}) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [sortBy, setSortBy] = useState<"priority" | "dueDate" | "createdAt">(
    "priority"
  );
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    todoId: string | null;
    todoTitle: string;
  }>({
    isOpen: false,
    todoId: null,
    todoTitle: "",
  });
  const [expandedTodos, setExpandedTodos] = useState<Set<string>>(new Set());

  const sortOptions = [
    { value: "priority", label: "Sort by Priority", icon: "🔥" },
    { value: "dueDate", label: "Sort by Due Date", icon: "📅" },
    { value: "createdAt", label: "Sort by Created", icon: "🕒" },
  ];

  const getCurrentSortLabel = () => {
    return (
      sortOptions.find((option) => option.value === sortBy)?.label ||
      "Sort by Priority"
    );
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsSortDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filteredTodos = useMemo(() => {
    let filtered = todos;

    // Apply filter
    switch (filter) {
      case "active":
        filtered = todos.filter((todo) => !todo.completed);
        break;
      case "completed":
        filtered = todos.filter((todo) => todo.completed);
        break;
      default:
        filtered = todos;
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "priority": {
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
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

    return filtered;
  }, [todos, filter, sortBy]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "from-red-500 to-pink-500";
      case "medium":
        return "from-yellow-500 to-orange-500";
      case "low":
        return "from-green-500 to-emerald-500";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return "🔥";
      case "medium":
        return "⚡";
      case "low":
        return "🌱";
      default:
        return "📝";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    } else {
      return date.toLocaleDateString();
    }
  };

  const isOverdue = (dueDate: string) => {
    return (
      new Date(dueDate) < new Date() &&
      new Date(dueDate).toDateString() !== new Date().toDateString()
    );
  };

  const handleDeleteClick = (todoId: string, todoTitle: string) => {
    setDeleteConfirmation({
      isOpen: true,
      todoId,
      todoTitle,
    });
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmation.todoId) {
      onDeleteTodo(deleteConfirmation.todoId);
    }
    setDeleteConfirmation({
      isOpen: false,
      todoId: null,
      todoTitle: "",
    });
  };

  const toggleExpanded = (todoId: string) => {
    setExpandedTodos((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(todoId)) {
        newSet.delete(todoId);
      } else {
        newSet.add(todoId);
      }
      return newSet;
    });
  };

  const isExpanded = (todoId: string) => expandedTodos.has(todoId);

  const completedCount = todos.filter((todo) => todo.completed).length;
  const totalCount = todos.length;

  return (
    <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-4 sm:p-6 border border-gray-700/30 backdrop-blur-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 mb-4 sm:mb-6">
        <div>
          <h3 className="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-600 bg-clip-text text-transparent mb-1 tracking-tight">
            TODO LIST
          </h3>
          <p className="text-gray-400 text-sm">
            {completedCount} of {totalCount} completed
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Progress indicator */}
          <div className="flex items-center gap-2 bg-blue-500/10 px-2 sm:px-3 py-1.5 rounded-lg">
            <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-300"
                style={{
                  width: `${
                    totalCount > 0 ? (completedCount / totalCount) * 100 : 0
                  }%`,
                }}
              />
            </div>
            <span className="text-blue-500 font-medium text-sm">
              {totalCount > 0
                ? Math.round((completedCount / totalCount) * 100)
                : 0}
              %
            </span>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="group relative px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700 rounded-lg font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25 focus:outline-none focus:ring-4 focus:ring-blue-500/50"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700 rounded-lg blur opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center gap-2">
              <Plus size={18} />
              Add Todo
            </div>
          </button>
        </div>
      </div>

      {/* Filters and Sorting */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
        <div className="flex items-center gap-1 sm:gap-2 bg-gray-800/50 rounded-lg p-1">
          {(["all", "active", "completed"] as const).map((filterOption) => (
            <button
              key={filterOption}
              onClick={() => setFilter(filterOption)}
              className={`px-2 sm:px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                filter === filterOption
                  ? "bg-blue-500/20 text-blue-400"
                  : "text-gray-400 hover:text-white hover:bg-gray-700/50"
              }`}
            >
              {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
            </button>
          ))}
        </div>

        {/* Custom Sort Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-gray-700/50 hover:border-gray-600/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 shadow-sm hover:shadow-md"
          >
            <span className="font-medium">{getCurrentSortLabel()}</span>
            <ChevronDown
              size={16}
              className={`transition-transform duration-200 ${
                isSortDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          <AnimatePresence>
            {isSortDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="absolute top-full left-0 mt-2 w-56 bg-gray-800/95 backdrop-blur-sm border border-gray-700/50 rounded-xl shadow-2xl z-50 overflow-hidden"
              >
                <div className="py-1">
                  {sortOptions.map((option, index) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSortBy(
                          option.value as "priority" | "dueDate" | "createdAt"
                        );
                        setIsSortDropdownOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-200 ${
                        sortBy === option.value
                          ? "bg-blue-500/20 text-blue-400 border-r-2 border-blue-500"
                          : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                      } ${index === 0 ? "rounded-t-xl" : ""} ${
                        index === sortOptions.length - 1 ? "rounded-b-xl" : ""
                      }`}
                    >
                      <span className="text-lg">{option.icon}</span>
                      <span className="flex-1 text-left">{option.label}</span>
                      {sortBy === option.value && (
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Todo List */}
      <div className="space-y-2 sm:space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredTodos.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-12 text-gray-500"
            >
              <div className="text-6xl mb-4">📝</div>
              <p className="text-lg font-medium mb-2">
                {filter === "all" ? "No todos yet" : `No ${filter} todos`}
              </p>
              <p className="text-sm">
                {filter === "all"
                  ? "Create your first todo to get started!"
                  : `All todos are ${
                      filter === "active" ? "completed" : "pending"
                    }`}
              </p>
            </motion.div>
          ) : (
            filteredTodos.map((todo) => (
              <motion.div
                key={todo.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className={`group relative bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-xl p-3 sm:p-4 border transition-all duration-300 hover:scale-[1.02] cursor-pointer ${
                  todo.completed
                    ? "border-green-500/30 opacity-75"
                    : "border-gray-700/30 hover:border-gray-600/50"
                }`}
                onClick={() => toggleExpanded(todo.id)}
              >
                {/* Mobile Layout - Stacked */}
                <div className="block sm:hidden">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      {/* Checkbox */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleTodo(todo.id);
                        }}
                        className={`flex-shrink-0 mt-1 p-1 rounded-lg transition-all duration-200 ${
                          todo.completed
                            ? "text-green-400 hover:text-green-300"
                            : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                        }`}
                      >
                        {todo.completed ? (
                          <CheckCircle size={20} />
                        ) : (
                          <Circle size={20} />
                        )}
                      </button>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h4
                          className={`font-medium text-sm transition-all duration-200 ${
                            todo.completed
                              ? "line-through text-gray-500"
                              : "text-white"
                          }`}
                        >
                          {todo.title}
                        </h4>
                        {todo.description && (
                          <motion.p
                            initial={false}
                            animate={{
                              height: isExpanded(todo.id) ? "auto" : "2.5rem",
                              overflow: isExpanded(todo.id)
                                ? "visible"
                                : "hidden",
                            }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className={`text-sm mt-1 transition-all duration-200 ${
                              todo.completed
                                ? "line-through text-gray-600"
                                : "text-gray-400"
                            } ${!isExpanded(todo.id) ? "line-clamp-2" : ""}`}
                          >
                            {todo.description}
                          </motion.p>
                        )}
                      </div>
                    </div>

                    {/* Priority Badge - Rightmost */}
                    <div
                      className={`flex-shrink-0 px-1.5 py-1 rounded-lg text-xs font-medium bg-gradient-to-r ${getPriorityColor(
                        todo.priority
                      )} bg-clip-text text-transparent`}
                    >
                      {getPriorityIcon(todo.priority)} {todo.priority}
                    </div>
                  </div>

                  {/* Meta Information - Full Width */}
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                    {todo.dueDate && (
                      <div
                        className={`flex items-center gap-1 ${
                          isOverdue(todo.dueDate) && !todo.completed
                            ? "text-red-400"
                            : ""
                        }`}
                      >
                        <Calendar size={12} />
                        <span>
                          {isOverdue(todo.dueDate) && !todo.completed
                            ? "Overdue: "
                            : ""}
                          {formatDate(todo.dueDate)}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Clock size={12} />
                      <span>{formatDate(todo.createdAt)}</span>
                    </div>
                  </div>

                  {/* Actions - Full Width */}
                  <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditTodo(todo.id, { completed: !todo.completed });
                      }}
                      className="p-1 text-gray-400 hover:text-blue-400 hover:bg-blue-900/20 rounded-lg transition-all duration-200"
                      title="Edit todo"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(todo.id, todo.title);
                      }}
                      className="p-1 text-gray-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-all duration-200"
                      title="Delete todo"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Desktop Layout - Horizontal */}
                <div className="hidden sm:flex items-start gap-3">
                  {/* Checkbox */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleTodo(todo.id);
                    }}
                    className={`flex-shrink-0 mt-1 p-1 rounded-lg transition-all duration-200 ${
                      todo.completed
                        ? "text-green-400 hover:text-green-300"
                        : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                    }`}
                  >
                    {todo.completed ? (
                      <CheckCircle size={20} />
                    ) : (
                      <Circle size={20} />
                    )}
                  </button>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h4
                          className={`font-medium text-base transition-all duration-200 ${
                            todo.completed
                              ? "line-through text-gray-500"
                              : "text-white"
                          }`}
                        >
                          {todo.title}
                        </h4>
                        {todo.description && (
                          <motion.p
                            initial={false}
                            animate={{
                              height: isExpanded(todo.id) ? "auto" : "2.5rem",
                              overflow: isExpanded(todo.id)
                                ? "visible"
                                : "hidden",
                            }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className={`text-sm mt-1 transition-all duration-200 ${
                              todo.completed
                                ? "line-through text-gray-600"
                                : "text-gray-400"
                            } ${!isExpanded(todo.id) ? "line-clamp-2" : ""}`}
                          >
                            {todo.description}
                          </motion.p>
                        )}
                      </div>
                    </div>

                    {/* Meta Information */}
                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                      {todo.dueDate && (
                        <div
                          className={`flex items-center gap-1 ${
                            isOverdue(todo.dueDate) && !todo.completed
                              ? "text-red-400"
                              : ""
                          }`}
                        >
                          <Calendar size={12} />
                          <span>
                            {isOverdue(todo.dueDate) && !todo.completed
                              ? "Overdue: "
                              : ""}
                            {formatDate(todo.dueDate)}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Clock size={12} />
                        <span>{formatDate(todo.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Priority Badge */}
                  <div
                    className={`flex-shrink-0 px-2 py-1 rounded-lg text-xs font-medium bg-gradient-to-r ${getPriorityColor(
                      todo.priority
                    )} bg-clip-text text-transparent`}
                  >
                    {getPriorityIcon(todo.priority)} {todo.priority}
                  </div>

                  {/* Actions */}
                  <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditTodo(todo.id, { completed: !todo.completed });
                      }}
                      className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-blue-900/20 rounded-lg transition-all duration-200"
                      title="Edit todo"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(todo.id, todo.title);
                      }}
                      className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-all duration-200"
                      title="Delete todo"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Create Todo Modal */}
      <CreateTodoModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onConfirm={onCreateTodo}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={deleteConfirmation.isOpen}
        onClose={() =>
          setDeleteConfirmation({
            isOpen: false,
            todoId: null,
            todoTitle: "",
          })
        }
        onConfirm={handleConfirmDelete}
        title="Delete Todo"
        message={`Are you sure you want to delete "${deleteConfirmation.todoTitle}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

// Create Todo Modal Component
interface CreateTodoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (todo: Omit<Todo, "id" | "createdAt">) => void;
}

const CreateTodoModal: React.FC<CreateTodoModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [dueDate, setDueDate] = useState("");
  const [isPriorityDropdownOpen, setIsPriorityDropdownOpen] = useState(false);
  const priorityDropdownRef = useRef<HTMLDivElement>(null);

  const priorityOptions = [
    {
      value: "low",
      label: "Low",
      icon: "🌱",
      color: "from-green-500 to-emerald-500",
    },
    {
      value: "medium",
      label: "Medium",
      icon: "⚡",
      color: "from-yellow-500 to-orange-500",
    },
    {
      value: "high",
      label: "High",
      icon: "🔥",
      color: "from-red-500 to-pink-500",
    },
  ];

  const getCurrentPriorityLabel = () => {
    return (
      priorityOptions.find((option) => option.value === priority)?.label ||
      "Medium"
    );
  };

  // Close priority dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        priorityDropdownRef.current &&
        !priorityDropdownRef.current.contains(event.target as Node)
      ) {
        setIsPriorityDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onConfirm({
        title: title.trim(),
        description: description.trim() || undefined,
        completed: false,
        priority,
        dueDate: dueDate || undefined,
        category: undefined,
      });
      setTitle("");
      setDescription("");
      setPriority("medium");
      setDueDate("");
      onClose();
    }
  };

  const handleClose = () => {
    setTitle("");
    setDescription("");
    setPriority("medium");
    setDueDate("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={handleClose}
      />

      <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 sm:p-8 mx-4 w-full max-w-md shadow-2xl border border-gray-700/50 animate-scale-in">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-cyan-900/20 rounded-2xl"></div>

        <div className="relative">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Create New Todo
            </h2>
            <button
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all duration-200"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm sm:text-base font-medium text-gray-300 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter todo title..."
                className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 hover:bg-gray-700/50 hover:border-gray-600/50 shadow-sm focus:shadow-md"
                maxLength={100}
                autoFocus
                required
              />
            </div>

            <div>
              <label className="block text-sm sm:text-base font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter description (optional)..."
                rows={3}
                className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 hover:bg-gray-700/50 hover:border-gray-600/50 shadow-sm focus:shadow-md resize-none"
                maxLength={500}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm sm:text-base font-medium text-gray-300 mb-2">
                  Priority
                </label>
                <div className="relative" ref={priorityDropdownRef}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsPriorityDropdownOpen(!isPriorityDropdownOpen);
                    }}
                    className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white hover:bg-gray-700/50 hover:border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <span className="font-medium">
                      {getCurrentPriorityLabel()}
                    </span>
                    <ChevronDown
                      size={16}
                      className={`transition-transform duration-200 ${
                        isPriorityDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {isPriorityDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="absolute top-full left-0 mt-2 w-full bg-gray-800/95 backdrop-blur-sm border border-gray-700/50 rounded-xl shadow-2xl z-50 overflow-hidden"
                      >
                        <div className="py-1">
                          {priorityOptions.map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setPriority(
                                  option.value as "low" | "medium" | "high"
                                );
                                setIsPriorityDropdownOpen(false);
                              }}
                              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-200 ${
                                priority === option.value
                                  ? "bg-blue-500/20 text-blue-400 border-r-2 border-blue-500"
                                  : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                              }`}
                            >
                              <span className="text-lg">{option.icon}</span>
                              <span className="flex-1 text-left">
                                {option.label}
                              </span>
                              {priority === option.value && (
                                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                              )}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div>
                <label className="block text-sm sm:text-base font-medium text-gray-300 mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 hover:bg-gray-700/50 hover:border-gray-600/50 shadow-sm focus:shadow-md"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <button
                type="button"
                onClick={handleClose}
                className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!title.trim()}
                className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-medium transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Create Todo
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TodoList;
