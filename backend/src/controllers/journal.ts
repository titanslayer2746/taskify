import { Request, Response } from "express";
import { Journal } from "../models/Journal";

// Create a new journal entry
export const createJournalEntry = async (req: Request, res: Response) => {
  try {
    const { title, content, tags } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Validation
    if (!title && !content) {
      return res.status(400).json({
        success: false,
        message: "Title or content is required",
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

    // Create new journal entry
    const newEntry = new Journal({
      title: title?.trim() || "",
      content: content?.trim() || "",
      tags: tags?.map((tag: string) => tag.trim()) || [],
      userId,
    });

    await newEntry.save();

    const entryResponse = {
      id: newEntry._id,
      title: newEntry.title,
      content: newEntry.content,
      tags: newEntry.tags,
      createdAt: newEntry.createdAt,
      updatedAt: newEntry.updatedAt,
    };

    res.status(201).json({
      success: true,
      message: "Journal entry created successfully",
      data: {
        entry: entryResponse,
      },
    });
  } catch (error) {
    console.error("Create journal entry error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get all journal entries for a user
export const getJournalEntries = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { search, tag } = req.query;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    let query: any = { userId };

    // Add search functionality
    if (search && typeof search === "string") {
      query.$text = { $search: search };
    }

    // Add tag filter
    if (tag && typeof tag === "string") {
      query.tags = tag;
    }

    const entries = await Journal.find(query)
      .sort({ updatedAt: -1 })
      .select("-__v");

    const entriesResponse = entries.map((entry) => ({
      id: entry._id,
      title: entry.title,
      content: entry.content,
      tags: entry.tags,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
    }));

    res.status(200).json({
      success: true,
      message: "Journal entries retrieved successfully",
      data: {
        entries: entriesResponse,
      },
    });
  } catch (error) {
    console.error("Get journal entries error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get a specific journal entry
export const getJournalEntry = async (req: Request, res: Response) => {
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
    const entry = await Journal.findOne({ _id: entryId, userId });
    if (!entry) {
      return res.status(404).json({
        success: false,
        message: "Journal entry not found",
      });
    }

    const entryResponse = {
      id: entry._id,
      title: entry.title,
      content: entry.content,
      tags: entry.tags,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
    };

    res.status(200).json({
      success: true,
      message: "Journal entry retrieved successfully",
      data: {
        entry: entryResponse,
      },
    });
  } catch (error) {
    console.error("Get journal entry error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Update a journal entry
export const updateJournalEntry = async (req: Request, res: Response) => {
  try {
    const { entryId } = req.params;
    const { title, content, tags, isExplicitSave } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Find entry and ensure it belongs to the user
    const entry = await Journal.findOne({ _id: entryId, userId });
    if (!entry) {
      return res.status(404).json({
        success: false,
        message: "Journal entry not found",
      });
    }

    // Update fields if provided
    if (title !== undefined) {
      entry.title = title.trim();
    }

    if (content !== undefined) {
      entry.content = content.trim();
    }

    if (tags !== undefined) {
      // Validate tags
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

    // Update timestamp based on save type
    if (isExplicitSave) {
      entry.updatedAt = new Date();
    }

    await entry.save();

    const entryResponse = {
      id: entry._id,
      title: entry.title,
      content: entry.content,
      tags: entry.tags,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
    };

    res.status(200).json({
      success: true,
      message: "Journal entry updated successfully",
      data: {
        entry: entryResponse,
      },
    });
  } catch (error) {
    console.error("Update journal entry error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Delete a journal entry
export const deleteJournalEntry = async (req: Request, res: Response) => {
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
    const entry = await Journal.findOne({ _id: entryId, userId });
    if (!entry) {
      return res.status(404).json({
        success: false,
        message: "Journal entry not found",
      });
    }

    await Journal.findByIdAndDelete(entryId);

    res.status(200).json({
      success: true,
      message: "Journal entry deleted successfully",
    });
  } catch (error) {
    console.error("Delete journal entry error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Search journal entries
export const searchJournalEntries = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { q, tag } = req.query;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    let query: any = { userId };

    // Add search query
    if (q && typeof q === "string") {
      query.$text = { $search: q };
    }

    // Add tag filter
    if (tag && typeof tag === "string") {
      query.tags = tag;
    }

    const entries = await Journal.find(query)
      .sort({ updatedAt: -1 })
      .select("-__v");

    const entriesResponse = entries.map((entry) => ({
      id: entry._id,
      title: entry.title,
      content: entry.content,
      tags: entry.tags,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
    }));

    res.status(200).json({
      success: true,
      message: "Search completed successfully",
      data: {
        entries: entriesResponse,
        count: entries.length,
      },
    });
  } catch (error) {
    console.error("Search journal entries error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
