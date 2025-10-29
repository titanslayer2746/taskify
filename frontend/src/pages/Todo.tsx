import React, { useState, useEffect } from "react";
import TodoList from "../components/TodoList";
import Navbar from "../components/Navbar";
import ConfirmationDialog from "../components/ConfirmationDialog";
import {
  CheckSquare,
  Clock,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { apiService } from "@/services/api";
import { Todo } from "@/services/types";
import { useAuth } from "@/contexts/AuthContext";

const TodoPage = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [optimisticUpdates, setOptimisticUpdates] = useState<Map<string, any>>(
    new Map()
  );
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    todoId: string | null;
    todoTitle: string;
  }>({
    isOpen: false,
    todoId: null,
    todoTitle: "",
  });
  const { user } = useAuth();

  // Fetch todos from API
  const fetchTodos = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiService.getTodos();

      if (response.success && response.data) {
        setTodos(response.data.todos);
      } else {
        setError(response.message || "Failed to fetch todos");
      }
    } catch (error: any) {
      console.error("Error fetching todos:", error);
      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch todos. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Load todos on component mount
  useEffect(() => {
    if (user) {
      fetchTodos();
    }
  }, [user]);

  // Create new todo with optimistic update
  const createTodo = async (
    todoData: Omit<Todo, "id" | "createdAt" | "updatedAt">
  ) => {
    try {
      setIsCreating(true);
      setError(null);

      // Create optimistic todo
      const optimisticTodo: Todo = {
        id: `temp-${Date.now()}`,
        title: todoData.title,
        description: todoData.description || "",
        completed: todoData.completed,
        priority: todoData.priority,
        dueDate: todoData.dueDate,
        category: todoData.category || "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Add optimistic update
      setOptimisticUpdates(
        (prev) => new Map(prev.set(optimisticTodo.id, optimisticTodo))
      );
      setTodos((prev) => [optimisticTodo, ...prev]);

      // Make API call
      const response = await apiService.createTodo({
        title: todoData.title,
        description: todoData.description,
        priority: todoData.priority,
        dueDate: todoData.dueDate,
        category: todoData.category,
      });

      if (response.success && response.data) {
        // Replace optimistic todo with real one
        setTodos((prev) =>
          prev.map((todo) =>
            todo.id === optimisticTodo.id ? response.data.todo : todo
          )
        );
      } else {
        // Remove optimistic update on error
        setTodos((prev) =>
          prev.filter((todo) => todo.id !== optimisticTodo.id)
        );
        setError(response.message || "Failed to create todo");
      }
    } catch (error: any) {
      console.error("Error creating todo:", error);

      // Remove optimistic update on error
      setTodos((prev) => prev.filter((todo) => !todo.id.startsWith("temp-")));
      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to create todo. Please try again."
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

  // Toggle todo completion with optimistic update
  const toggleTodo = async (todoId: string) => {
    try {
      // Create optimistic update
      const optimisticTodo = todos.find((t) => t.id === todoId);
      if (!optimisticTodo) return;

      const updatedTodo = {
        ...optimisticTodo,
        completed: !optimisticTodo.completed,
        updatedAt: new Date().toISOString(),
      };

      // Apply optimistic update
      setOptimisticUpdates((prev) => new Map(prev.set(todoId, updatedTodo)));
      setTodos((prev) =>
        prev.map((todo) => (todo.id === todoId ? updatedTodo : todo))
      );

      // Make API call
      const response = await apiService.updateTodo(todoId, {
        completed: !optimisticTodo.completed,
      });

      if (response.success && response.data) {
        // Replace with real data
        setTodos((prev) =>
          prev.map((todo) => (todo.id === todoId ? response.data.todo : todo))
        );
      } else {
        // Revert optimistic update on error
        setTodos((prev) =>
          prev.map((todo) => (todo.id === todoId ? optimisticTodo : todo))
        );
        setError(response.message || "Failed to update todo");
      }
    } catch (error: any) {
      console.error("Error toggling todo:", error);

      // Revert optimistic update on error
      const originalTodo = todos.find((t) => t.id === todoId);
      if (originalTodo) {
        setTodos((prev) =>
          prev.map((todo) => (todo.id === todoId ? originalTodo : todo))
        );
      }
      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to update todo. Please try again."
      );
    } finally {
      setOptimisticUpdates((prev) => {
        const newMap = new Map(prev);
        newMap.delete(todoId);
        return newMap;
      });
    }
  };

  // Edit todo with optimistic update
  const editTodo = async (todoId: string, updates: Partial<Todo>) => {
    try {
      // Create optimistic update
      const optimisticTodo = todos.find((t) => t.id === todoId);
      if (!optimisticTodo) return;

      const updatedTodo = {
        ...optimisticTodo,
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      // Apply optimistic update
      setOptimisticUpdates((prev) => new Map(prev.set(todoId, updatedTodo)));
      setTodos((prev) =>
        prev.map((todo) => (todo.id === todoId ? updatedTodo : todo))
      );

      // Make API call
      const response = await apiService.updateTodo(todoId, updates);

      if (response.success && response.data) {
        // Replace with real data
        setTodos((prev) =>
          prev.map((todo) => (todo.id === todoId ? response.data.todo : todo))
        );
      } else {
        // Revert optimistic update on error
        setTodos((prev) =>
          prev.map((todo) => (todo.id === todoId ? optimisticTodo : todo))
        );
        setError(response.message || "Failed to update todo");
      }
    } catch (error: any) {
      console.error("Error editing todo:", error);

      // Revert optimistic update on error
      const originalTodo = todos.find((t) => t.id === todoId);
      if (originalTodo) {
        setTodos((prev) =>
          prev.map((todo) => (todo.id === todoId ? originalTodo : todo))
        );
      }
      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to update todo. Please try again."
      );
    } finally {
      setOptimisticUpdates((prev) => {
        const newMap = new Map(prev);
        newMap.delete(todoId);
        return newMap;
      });
    }
  };

  // Handle delete click - show confirmation dialog
  const handleDeleteClick = (todoId: string, todoTitle: string) => {
    setDeleteConfirmation({
      isOpen: true,
      todoId,
      todoTitle,
    });
  };

  // Handle confirm delete
  const handleConfirmDelete = () => {
    if (deleteConfirmation.todoId) {
      deleteTodo(deleteConfirmation.todoId);
    }
    setDeleteConfirmation({
      isOpen: false,
      todoId: null,
      todoTitle: "",
    });
  };

  // Delete todo with optimistic update
  const deleteTodo = async (todoId: string) => {
    try {
      // Store original todo for rollback
      const originalTodo = todos.find((t) => t.id === todoId);
      if (!originalTodo) return;

      // Apply optimistic update
      setOptimisticUpdates((prev) => new Map(prev.set(todoId, null)));
      setTodos((prev) => prev.filter((todo) => todo.id !== todoId));

      // Make API call
      const response = await apiService.deleteTodo(todoId);

      if (!response.success) {
        // Revert optimistic update on error
        setTodos((prev) => [...prev, originalTodo]);
        setError(response.message || "Failed to delete todo");
      }
    } catch (error: any) {
      console.error("Error deleting todo:", error);

      // Revert optimistic update on error
      const originalTodo = todos.find((t) => t.id === todoId);
      if (originalTodo) {
        setTodos((prev) => [...prev, originalTodo]);
      }
      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to delete todo. Please try again."
      );
    } finally {
      setOptimisticUpdates((prev) => {
        const newMap = new Map(prev);
        newMap.delete(todoId);
        return newMap;
      });
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        <Navbar />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-blue-400 mb-4" />
            <p className="text-gray-400">Loading your todos...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && todos.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        <Navbar />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Failed to load todos
            </h3>
            <p className="text-gray-400 text-center mb-6 max-w-md">{error}</p>
            <button
              onClick={fetchTodos}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </div>
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

        <TodoList
          todos={todos}
          onToggleTodo={toggleTodo}
          onDeleteTodo={deleteTodo}
          onCreateTodo={createTodo}
          onDeleteClick={handleDeleteClick}
        />
      </div>

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

export default TodoPage;
