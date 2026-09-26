import React, { useState, useEffect } from "react";
import TodoList from "../components/TodoList";
import PaperPage, {
  PaperBanner,
  PaperErrorState,
  PaperLoading,
} from "../components/paper/PaperPage";
import { todayDateline } from "@/lib/paper";
import ConfirmationDialog from "../components/ConfirmationDialog";
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

  const closeDeleteConfirmation = () =>
    setDeleteConfirmation({ isOpen: false, todoId: null, todoTitle: "" });

  return (
    <PaperPage number="01" title="Tasks" subtitle={todayDateline()} width="narrow">
      {isLoading ? (
        <PaperLoading label="Opening your list…" />
      ) : error && todos.length === 0 ? (
        <PaperErrorState message={error} onRetry={fetchTodos} />
      ) : (
        <>
          {error && (
            <PaperBanner message={error} onDismiss={() => setError(null)} />
          )}
          <TodoList
            todos={todos}
            onToggleTodo={toggleTodo}
            onCreateTodo={createTodo}
            onDeleteClick={handleDeleteClick}
          />
        </>
      )}

      <ConfirmationDialog
        isOpen={deleteConfirmation.isOpen}
        onClose={closeDeleteConfirmation}
        onConfirm={handleConfirmDelete}
        title="Delete this task?"
        message={`“${deleteConfirmation.todoTitle}” will be removed for good.`}
        confirmText="Delete"
        cancelText="Keep it"
        type="danger"
      />
    </PaperPage>
  );
};

export default TodoPage;
