import { Request, Response } from "express";
import { Todo } from "../models/Todo";

// Create a new todo
export const createTodo = async (req: Request, res: Response) => {
  try {
    const { title, description, priority, dueDate, category } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Validation
    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Todo title is required",
      });
    }

    if (title.trim().length > 100) {
      return res.status(400).json({
        success: false,
        message: "Todo title must be 100 characters or less",
      });
    }

    if (description && description.trim().length > 500) {
      return res.status(400).json({
        success: false,
        message: "Todo description must be 500 characters or less",
      });
    }

    // Validate priority
    const validPriorities = ["low", "medium", "high"];
    if (priority && !validPriorities.includes(priority)) {
      return res.status(400).json({
        success: false,
        message: "Priority must be low, medium, or high",
      });
    }

    // Validate due date format if provided
    if (dueDate && !/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
      return res.status(400).json({
        success: false,
        message: "Due date must be in YYYY-MM-DD format",
      });
    }

    // Create new todo
    const newTodo = new Todo({
      title: title.trim(),
      description: description?.trim() || "",
      completed: false,
      priority: priority || "medium",
      dueDate: dueDate || undefined,
      category: category?.trim() || "",
      userId,
    });

    await newTodo.save();

    const todoResponse = {
      id: newTodo._id,
      title: newTodo.title,
      description: newTodo.description,
      completed: newTodo.completed,
      priority: newTodo.priority,
      dueDate: newTodo.dueDate,
      category: newTodo.category,
      createdAt: newTodo.createdAt,
      updatedAt: newTodo.updatedAt,
    };

    res.status(201).json({
      success: true,
      message: "Todo created successfully",
      data: {
        todo: todoResponse,
      },
    });
  } catch (error) {
    console.error("Create todo error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get all todos for a user
export const getTodos = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const todos = await Todo.find({ userId }).sort({ createdAt: -1 });

    const todosResponse = todos.map((todo) => ({
      id: todo._id,
      title: todo.title,
      description: todo.description,
      completed: todo.completed,
      priority: todo.priority,
      dueDate: todo.dueDate,
      category: todo.category,
      createdAt: todo.createdAt,
      updatedAt: todo.updatedAt,
    }));

    res.status(200).json({
      success: true,
      message: "Todos retrieved successfully",
      data: {
        todos: todosResponse,
      },
    });
  } catch (error) {
    console.error("Get todos error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Toggle todo completion
export const toggleTodo = async (req: Request, res: Response) => {
  try {
    const { todoId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Find todo and ensure it belongs to the user
    const todo = await Todo.findOne({ _id: todoId, userId });
    if (!todo) {
      return res.status(404).json({
        success: false,
        message: "Todo not found",
      });
    }

    // Toggle completion
    todo.completed = !todo.completed;
    await todo.save();

    const todoResponse = {
      id: todo._id,
      title: todo.title,
      description: todo.description,
      completed: todo.completed,
      priority: todo.priority,
      dueDate: todo.dueDate,
      category: todo.category,
      createdAt: todo.createdAt,
      updatedAt: todo.updatedAt,
    };

    res.status(200).json({
      success: true,
      message: "Todo completion toggled successfully",
      data: {
        todo: todoResponse,
      },
    });
  } catch (error) {
    console.error("Toggle todo error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Edit a todo
export const editTodo = async (req: Request, res: Response) => {
  try {
    const { todoId } = req.params;
    const { title, description, priority, dueDate, category, completed } =
      req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Find todo and ensure it belongs to the user
    const todo = await Todo.findOne({ _id: todoId, userId });
    if (!todo) {
      return res.status(404).json({
        success: false,
        message: "Todo not found",
      });
    }

    // Validation
    if (title !== undefined) {
      if (!title.trim()) {
        return res.status(400).json({
          success: false,
          message: "Todo title cannot be empty",
        });
      }
      if (title.trim().length > 100) {
        return res.status(400).json({
          success: false,
          message: "Todo title must be 100 characters or less",
        });
      }
      todo.title = title.trim();
    }

    if (description !== undefined) {
      if (description.trim().length > 500) {
        return res.status(400).json({
          success: false,
          message: "Todo description must be 500 characters or less",
        });
      }
      todo.description = description.trim();
    }

    if (priority !== undefined) {
      const validPriorities = ["low", "medium", "high"];
      if (!validPriorities.includes(priority)) {
        return res.status(400).json({
          success: false,
          message: "Priority must be low, medium, or high",
        });
      }
      todo.priority = priority;
    }

    if (dueDate !== undefined) {
      if (dueDate && !/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
        return res.status(400).json({
          success: false,
          message: "Due date must be in YYYY-MM-DD format",
        });
      }
      todo.dueDate = dueDate || undefined;
    }

    if (category !== undefined) {
      todo.category = category?.trim() || "";
    }

    if (completed !== undefined) {
      todo.completed = completed;
    }

    await todo.save();

    const todoResponse = {
      id: todo._id,
      title: todo.title,
      description: todo.description,
      completed: todo.completed,
      priority: todo.priority,
      dueDate: todo.dueDate,
      category: todo.category,
      createdAt: todo.createdAt,
      updatedAt: todo.updatedAt,
    };

    res.status(200).json({
      success: true,
      message: "Todo updated successfully",
      data: {
        todo: todoResponse,
      },
    });
  } catch (error) {
    console.error("Edit todo error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Delete a todo
export const deleteTodo = async (req: Request, res: Response) => {
  try {
    const { todoId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Find todo and ensure it belongs to the user
    const todo = await Todo.findOne({ _id: todoId, userId });
    if (!todo) {
      return res.status(404).json({
        success: false,
        message: "Todo not found",
      });
    }

    await Todo.findByIdAndDelete(todoId);

    res.status(200).json({
      success: true,
      message: "Todo deleted successfully",
    });
  } catch (error) {
    console.error("Delete todo error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get a specific todo
export const getTodo = async (req: Request, res: Response) => {
  try {
    const { todoId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Find todo and ensure it belongs to the user
    const todo = await Todo.findOne({ _id: todoId, userId });
    if (!todo) {
      return res.status(404).json({
        success: false,
        message: "Todo not found",
      });
    }

    const todoResponse = {
      id: todo._id,
      title: todo.title,
      description: todo.description,
      completed: todo.completed,
      priority: todo.priority,
      dueDate: todo.dueDate,
      category: todo.category,
      createdAt: todo.createdAt,
      updatedAt: todo.updatedAt,
    };

    res.status(200).json({
      success: true,
      message: "Todo retrieved successfully",
      data: {
        todo: todoResponse,
      },
    });
  } catch (error) {
    console.error("Get todo error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
