import React, { useState, useEffect } from "react";
import TodoList from "../components/TodoList";
import Navbar from "../components/Navbar";
import { CheckSquare, Clock } from "lucide-react";

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

const Todo = () => {
  const [todos, setTodos] = useState<Todo[]>([]);

  useEffect(() => {
    const savedTodos = localStorage.getItem("todos");
    if (savedTodos) {
      setTodos(JSON.parse(savedTodos));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

  const createTodo = (todoData: Omit<Todo, "id" | "createdAt">) => {
    const newTodo: Todo = {
      ...todoData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setTodos([...todos, newTodo]);
  };

  const toggleTodo = (todoId: string) => {
    setTodos(
      todos.map((todo) => {
        if (todo.id === todoId) {
          return {
            ...todo,
            completed: !todo.completed,
          };
        }
        return todo;
      })
    );
  };

  const deleteTodo = (todoId: string) => {
    setTodos(todos.filter((todo) => todo.id !== todoId));
  };

  const editTodo = (todoId: string, updates: Partial<Todo>) => {
    setTodos(
      todos.map((todo) => {
        if (todo.id === todoId) {
          return {
            ...todo,
            ...updates,
          };
        }
        return todo;
      })
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <Navbar />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-600 bg-clip-text text-transparent mb-3 sm:mb-4 tracking-tight leading-tight py-2">
            Todo List
          </h1>
          <p className="text-gray-400 text-base sm:text-lg">
            Organize tasks, set priorities, boost productivity
          </p>
        </div>

        <TodoList
          todos={todos}
          onToggleTodo={toggleTodo}
          onDeleteTodo={deleteTodo}
          onEditTodo={editTodo}
          onCreateTodo={createTodo}
        />
      </div>
    </div>
  );
};

export default Todo;
