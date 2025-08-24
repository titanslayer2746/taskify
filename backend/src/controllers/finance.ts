import { Request, Response } from "express";
import { Finance } from "../models/Finance";

// Create a new finance entry
export const createFinanceEntry = async (req: Request, res: Response) => {
  try {
    const { title, amount, type, category, tags, date, description } = req.body;
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
        message: "Title is required",
      });
    }

    if (title.trim().length > 100) {
      return res.status(400).json({
        success: false,
        message: "Title must be 100 characters or less",
      });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be greater than 0",
      });
    }

    if (!type || !["income", "expense"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Type must be either 'income' or 'expense'",
      });
    }

    if (!category || !category.trim()) {
      return res.status(400).json({
        success: false,
        message: "Category is required",
      });
    }

    // Validate category based on type
    const validCategories = {
      income: ["Salary", "Freelance", "Investment", "Business", "Other"],
      expense: [
        "Food & Dining",
        "Transportation",
        "Shopping",
        "Entertainment",
        "Healthcare",
        "Education",
        "Bills & Utilities",
        "Housing",
        "Other",
      ],
    };

    if (
      !validCategories[type as keyof typeof validCategories].includes(category)
    ) {
      return res.status(400).json({
        success: false,
        message: `Invalid category for ${type}. Valid categories: ${validCategories[
          type as keyof typeof validCategories
        ].join(", ")}`,
      });
    }

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        success: false,
        message: "Date must be in YYYY-MM-DD format",
      });
    }

    // Validate tags if provided
    if (tags && Array.isArray(tags)) {
      for (const tag of tags) {
        if (
          typeof tag !== "string" ||
          tag.trim().length === 0 ||
          tag.trim().length > 50
        ) {
          return res.status(400).json({
            success: false,
            message: "Tags must be strings between 1 and 50 characters",
          });
        }
      }
    }

    if (description && description.trim().length > 500) {
      return res.status(400).json({
        success: false,
        message: "Description must be 500 characters or less",
      });
    }

    // Create new finance entry
    const newEntry = new Finance({
      title: title.trim(),
      amount,
      type,
      category: category.trim(),
      tags: tags?.map((tag: string) => tag.trim()) || [],
      date,
      description: description?.trim() || "",
      userId,
    });

    await newEntry.save();

    const entryResponse = {
      id: newEntry._id,
      title: newEntry.title,
      amount: newEntry.amount,
      type: newEntry.type,
      category: newEntry.category,
      tags: newEntry.tags,
      date: newEntry.date,
      description: newEntry.description,
      createdAt: newEntry.createdAt,
      updatedAt: newEntry.updatedAt,
    };

    res.status(201).json({
      success: true,
      message: "Finance entry created successfully",
      data: {
        entry: entryResponse,
      },
    });
  } catch (error) {
    console.error("Create finance entry error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get all finance entries for a user
export const getFinanceEntries = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { type, category, tag, sortBy, sortOrder } = req.query;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    let query: any = { userId };

    // Add filters
    if (type && ["income", "expense"].includes(type as string)) {
      query.type = type;
    }

    if (category && typeof category === "string") {
      query.category = category;
    }

    if (tag && typeof tag === "string") {
      query.tags = tag;
    }

    // Build sort object
    let sort: any = { createdAt: -1 }; // Default sort
    if (sortBy && typeof sortBy === "string") {
      const validSortFields = ["date", "amount", "title", "createdAt"];
      if (validSortFields.includes(sortBy)) {
        sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };
      }
    }

    const entries = await Finance.find(query).sort(sort).select("-__v");

    const entriesResponse = entries.map((entry) => ({
      id: entry._id,
      title: entry.title,
      amount: entry.amount,
      type: entry.type,
      category: entry.category,
      tags: entry.tags,
      date: entry.date,
      description: entry.description,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
    }));

    res.status(200).json({
      success: true,
      message: "Finance entries retrieved successfully",
      data: {
        entries: entriesResponse,
      },
    });
  } catch (error) {
    console.error("Get finance entries error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get finance statistics
export const getFinanceStats = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Get all entries for the user
    const entries = await Finance.find({ userId });

    // Calculate statistics
    const totalIncome = entries
      .filter((entry) => entry.type === "income")
      .reduce((sum, entry) => sum + entry.amount, 0);

    const totalExpenses = entries
      .filter((entry) => entry.type === "expense")
      .reduce((sum, entry) => sum + entry.amount, 0);

    const balance = totalIncome - totalExpenses;

    // Get category breakdown
    const categoryBreakdown = entries.reduce((acc, entry) => {
      const category = entry.category;
      if (!acc[category]) {
        acc[category] = { income: 0, expense: 0 };
      }
      if (entry.type === "income") {
        acc[category].income += entry.amount;
      } else {
        acc[category].expense += entry.amount;
      }
      return acc;
    }, {} as Record<string, { income: number; expense: number }>);

    // Get monthly breakdown (last 12 months)
    const monthlyBreakdown = [];
    const currentDate = new Date();
    for (let i = 11; i >= 0; i--) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - i,
        1
      );
      const monthKey = date.toISOString().slice(0, 7); // YYYY-MM format

      const monthEntries = entries.filter((entry) =>
        entry.date.startsWith(monthKey)
      );

      const monthIncome = monthEntries
        .filter((entry) => entry.type === "income")
        .reduce((sum, entry) => sum + entry.amount, 0);

      const monthExpense = monthEntries
        .filter((entry) => entry.type === "expense")
        .reduce((sum, entry) => sum + entry.amount, 0);

      monthlyBreakdown.push({
        month: monthKey,
        income: monthIncome,
        expense: monthExpense,
        balance: monthIncome - monthExpense,
      });
    }

    res.status(200).json({
      success: true,
      message: "Finance statistics retrieved successfully",
      data: {
        balance,
        totalIncome,
        totalExpenses,
        categoryBreakdown,
        monthlyBreakdown,
        totalEntries: entries.length,
      },
    });
  } catch (error) {
    console.error("Get finance stats error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get a specific finance entry
export const getFinanceEntry = async (req: Request, res: Response) => {
  try {
    const { entryId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Find entry and ensure it belongs to the user
    const entry = await Finance.findOne({ _id: entryId, userId });
    if (!entry) {
      return res.status(404).json({
        success: false,
        message: "Finance entry not found",
      });
    }

    const entryResponse = {
      id: entry._id,
      title: entry.title,
      amount: entry.amount,
      type: entry.type,
      category: entry.category,
      tags: entry.tags,
      date: entry.date,
      description: entry.description,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
    };

    res.status(200).json({
      success: true,
      message: "Finance entry retrieved successfully",
      data: {
        entry: entryResponse,
      },
    });
  } catch (error) {
    console.error("Get finance entry error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Update a finance entry
export const updateFinanceEntry = async (req: Request, res: Response) => {
  try {
    const { entryId } = req.params;
    const { title, amount, type, category, tags, date, description } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Find entry and ensure it belongs to the user
    const entry = await Finance.findOne({ _id: entryId, userId });
    if (!entry) {
      return res.status(404).json({
        success: false,
        message: "Finance entry not found",
      });
    }

    // Validation and updates
    if (title !== undefined) {
      if (!title.trim()) {
        return res.status(400).json({
          success: false,
          message: "Title cannot be empty",
        });
      }
      if (title.trim().length > 100) {
        return res.status(400).json({
          success: false,
          message: "Title must be 100 characters or less",
        });
      }
      entry.title = title.trim();
    }

    if (amount !== undefined) {
      if (amount <= 0) {
        return res.status(400).json({
          success: false,
          message: "Amount must be greater than 0",
        });
      }
      entry.amount = amount;
    }

    if (type !== undefined) {
      if (!["income", "expense"].includes(type)) {
        return res.status(400).json({
          success: false,
          message: "Type must be either 'income' or 'expense'",
        });
      }
      entry.type = type;
    }

    if (category !== undefined) {
      const validCategories = {
        income: ["Salary", "Freelance", "Investment", "Business", "Other"],
        expense: [
          "Food & Dining",
          "Transportation",
          "Shopping",
          "Entertainment",
          "Healthcare",
          "Education",
          "Bills & Utilities",
          "Housing",
          "Other",
        ],
      };

      const currentType = type || entry.type;
      if (
        !validCategories[currentType as keyof typeof validCategories].includes(
          category
        )
      ) {
        return res.status(400).json({
          success: false,
          message: `Invalid category for ${currentType}`,
        });
      }
      entry.category = category.trim();
    }

    if (date !== undefined) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return res.status(400).json({
          success: false,
          message: "Date must be in YYYY-MM-DD format",
        });
      }
      entry.date = date;
    }

    if (tags !== undefined) {
      if (Array.isArray(tags)) {
        for (const tag of tags) {
          if (
            typeof tag !== "string" ||
            tag.trim().length === 0 ||
            tag.trim().length > 50
          ) {
            return res.status(400).json({
              success: false,
              message: "Tags must be strings between 1 and 50 characters",
            });
          }
        }
        entry.tags = tags.map((tag: string) => tag.trim());
      } else {
        return res.status(400).json({
          success: false,
          message: "Tags must be an array",
        });
      }
    }

    if (description !== undefined) {
      if (description.trim().length > 500) {
        return res.status(400).json({
          success: false,
          message: "Description must be 500 characters or less",
        });
      }
      entry.description = description.trim();
    }

    await entry.save();

    const entryResponse = {
      id: entry._id,
      title: entry.title,
      amount: entry.amount,
      type: entry.type,
      category: entry.category,
      tags: entry.tags,
      date: entry.date,
      description: entry.description,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
    };

    res.status(200).json({
      success: true,
      message: "Finance entry updated successfully",
      data: {
        entry: entryResponse,
      },
    });
  } catch (error) {
    console.error("Update finance entry error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Delete a finance entry
export const deleteFinanceEntry = async (req: Request, res: Response) => {
  try {
    const { entryId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Find entry and ensure it belongs to the user
    const entry = await Finance.findOne({ _id: entryId, userId });
    if (!entry) {
      return res.status(404).json({
        success: false,
        message: "Finance entry not found",
      });
    }

    await Finance.findByIdAndDelete(entryId);

    res.status(200).json({
      success: true,
      message: "Finance entry deleted successfully",
    });
  } catch (error) {
    console.error("Delete finance entry error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
