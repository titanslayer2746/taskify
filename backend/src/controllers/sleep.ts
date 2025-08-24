import { Request, Response } from "express";
import { SleepEntry } from "../models/Sleep";

interface SleepEntryInput {
  checkIn: string;
  checkOut?: string;
  duration?: number;
  notes?: string;
  quality?: 1 | 2 | 3 | 4 | 5;
  date: string;
  isActive?: boolean;
}

interface SortQuery {
  [key: string]: 1 | -1;
}

// Create a new sleep entry
export const createSleepEntry = async (req: Request, res: Response) => {
  try {
    const { checkIn, checkOut, duration, notes, quality, date } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Validation
    if (!checkIn) {
      return res.status(400).json({
        success: false,
        message: "Check-in time is required",
      });
    }

    // Validate ISO timestamps
    if (isNaN(Date.parse(checkIn))) {
      return res.status(400).json({
        success: false,
        message: "Check-in must be a valid ISO timestamp",
      });
    }

    // Validate check-out if provided
    if (checkOut) {
      if (isNaN(Date.parse(checkOut))) {
        return res.status(400).json({
          success: false,
          message: "Check-out must be a valid ISO timestamp",
        });
      }

      // Validate check-out is after check-in
      const checkInTime = new Date(checkIn);
      const checkOutTime = new Date(checkOut);
      if (checkOutTime <= checkInTime) {
        return res.status(400).json({
          success: false,
          message: "Check-out time must be after check-in time",
        });
      }
    }

    // Validate duration if provided
    if (duration !== undefined) {
      if (duration < 1 || duration > 1440) {
        return res.status(400).json({
          success: false,
          message: "Duration must be between 1 and 1440 minutes (24 hours)",
        });
      }

      // If both duration and checkOut are provided, validate they match
      if (checkOut) {
        const checkInTime = new Date(checkIn);
        const checkOutTime = new Date(checkOut);
        const expectedDuration = Math.round(
          (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60)
        );
        if (Math.abs(duration - expectedDuration) > 1) {
          return res.status(400).json({
            success: false,
            message:
              "Duration must match the time difference between check-in and check-out",
          });
        }
      }
    }

    // Validate notes
    if (notes && notes.trim().length > 1000) {
      return res.status(400).json({
        success: false,
        message: "Notes must be 1000 characters or less",
      });
    }

    // Validate quality
    if (quality !== undefined && ![1, 2, 3, 4, 5].includes(quality)) {
      return res.status(400).json({
        success: false,
        message: "Quality must be between 1 and 5",
      });
    }

    // Validate date format
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        success: false,
        message: "Date must be in YYYY-MM-DD format",
      });
    }

    // Note: Multiple sleep entries can exist for the same date
    // This allows users to track naps, multiple sleep sessions, etc.

    // Determine if session is active
    const isActive = !checkOut;

    // Create new sleep entry
    const newEntry = new SleepEntry({
      checkIn,
      checkOut: checkOut || undefined,
      duration: duration || undefined,
      notes: notes?.trim() || "",
      quality,
      date,
      isActive,
      userId,
    });

    await newEntry.save();

    const entryResponse = {
      id: newEntry._id,
      checkIn: newEntry.checkIn,
      checkOut: newEntry.checkOut,
      duration: newEntry.duration,
      notes: newEntry.notes,
      quality: newEntry.quality,
      date: newEntry.date,
      isActive: newEntry.isActive,
      createdAt: newEntry.createdAt,
      updatedAt: newEntry.updatedAt,
    };

    res.status(201).json({
      success: true,
      message: "Sleep entry created successfully",
      data: {
        entry: entryResponse,
      },
    });
  } catch (error) {
    console.error("Create sleep entry error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get all sleep entries for a user
export const getSleepEntries = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { sortBy, sortOrder, limit } = req.query;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Build sort object
    let sort: SortQuery = { date: -1 }; // Default sort by date descending
    if (sortBy && typeof sortBy === "string") {
      const validSortFields = [
        "date",
        "checkIn",
        "duration",
        "quality",
        "createdAt",
      ];
      if (validSortFields.includes(sortBy)) {
        sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };
      }
    }

    // Build query - supports multiple entries per date
    let query = SleepEntry.find({ userId }).sort(sort).select("-__v");

    // Apply limit if provided
    if (limit && typeof limit === "string") {
      const limitNum = parseInt(limit);
      if (!isNaN(limitNum) && limitNum > 0) {
        query = query.limit(limitNum);
      }
    }

    const entries = await query;

    const entriesResponse = entries.map((entry) => ({
      id: entry._id,
      checkIn: entry.checkIn,
      checkOut: entry.checkOut,
      duration: entry.duration,
      notes: entry.notes,
      quality: entry.quality,
      date: entry.date,
      isActive: entry.isActive,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
    }));

    res.status(200).json({
      success: true,
      message: "Sleep entries retrieved successfully",
      data: {
        entries: entriesResponse,
      },
    });
  } catch (error) {
    console.error("Get sleep entries error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get a specific sleep entry
export const getSleepEntry = async (req: Request, res: Response) => {
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
    const entry = await SleepEntry.findOne({ _id: entryId, userId });
    if (!entry) {
      return res.status(404).json({
        success: false,
        message: "Sleep entry not found",
      });
    }

    const entryResponse = {
      id: entry._id,
      checkIn: entry.checkIn,
      checkOut: entry.checkOut,
      duration: entry.duration,
      notes: entry.notes,
      quality: entry.quality,
      date: entry.date,
      isActive: entry.isActive,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
    };

    res.status(200).json({
      success: true,
      message: "Sleep entry retrieved successfully",
      data: {
        entry: entryResponse,
      },
    });
  } catch (error) {
    console.error("Get sleep entry error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Update a sleep entry
export const updateSleepEntry = async (req: Request, res: Response) => {
  try {
    const { entryId } = req.params;
    const { checkIn, checkOut, duration, notes, quality, date } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Find entry and ensure it belongs to the user
    const entry = await SleepEntry.findOne({ _id: entryId, userId });
    if (!entry) {
      return res.status(404).json({
        success: false,
        message: "Sleep entry not found",
      });
    }

    // Validation and updates
    if (checkIn !== undefined) {
      if (isNaN(Date.parse(checkIn))) {
        return res.status(400).json({
          success: false,
          message: "Check-in must be a valid ISO timestamp",
        });
      }
      entry.checkIn = checkIn;
    }

    if (checkOut !== undefined) {
      if (isNaN(Date.parse(checkOut))) {
        return res.status(400).json({
          success: false,
          message: "Check-out must be a valid ISO timestamp",
        });
      }
      entry.checkOut = checkOut;
    }

    if (duration !== undefined) {
      if (duration < 1 || duration > 1440) {
        return res.status(400).json({
          success: false,
          message: "Duration must be between 1 and 1440 minutes (24 hours)",
        });
      }
      entry.duration = duration;
    }

    if (notes !== undefined) {
      if (notes.trim().length > 1000) {
        return res.status(400).json({
          success: false,
          message: "Notes must be 1000 characters or less",
        });
      }
      entry.notes = notes.trim();
    }

    if (quality !== undefined) {
      if (![1, 2, 3, 4, 5].includes(quality)) {
        return res.status(400).json({
          success: false,
          message: "Quality must be between 1 and 5",
        });
      }
      entry.quality = quality;
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

    // Validate check-out is after check-in if both are being updated
    if (checkIn !== undefined || checkOut !== undefined) {
      const checkInTime = new Date(entry.checkIn);
      const checkOutTime = entry.checkOut ? new Date(entry.checkOut) : null;

      if (checkOutTime && checkOutTime <= checkInTime) {
        return res.status(400).json({
          success: false,
          message: "Check-out time must be after check-in time",
        });
      }

      // Recalculate duration if times changed and checkout exists
      if (checkOutTime) {
        const newDuration = Math.round(
          (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60)
        );
        entry.duration = newDuration;
      }
    }

    // Update isActive based on whether checkout exists
    if (checkOut !== undefined) {
      entry.isActive = !checkOut; // Active if no checkout, inactive if checkout provided
    }

    await entry.save();

    const entryResponse = {
      id: entry._id,
      checkIn: entry.checkIn,
      checkOut: entry.checkOut,
      duration: entry.duration,
      notes: entry.notes,
      quality: entry.quality,
      date: entry.date,
      isActive: entry.isActive,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
    };

    res.status(200).json({
      success: true,
      message: "Sleep entry updated successfully",
      data: {
        entry: entryResponse,
      },
    });
  } catch (error) {
    console.error("Update sleep entry error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Delete a sleep entry
export const deleteSleepEntry = async (req: Request, res: Response) => {
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
    const entry = await SleepEntry.findOne({ _id: entryId, userId });
    if (!entry) {
      return res.status(404).json({
        success: false,
        message: "Sleep entry not found",
      });
    }

    await SleepEntry.findByIdAndDelete(entryId);

    res.status(200).json({
      success: true,
      message: "Sleep entry deleted successfully",
    });
  } catch (error) {
    console.error("Delete sleep entry error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get sleep statistics
export const getSleepStats = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const entries = await SleepEntry.find({ userId }).sort({ date: -1 });

    if (entries.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No sleep entries found",
        data: {
          stats: {
            totalEntries: 0,
            averageDuration: 0,
            averageQuality: 0,
            totalDaysTracked: 0,
            bestQuality: 0,
            worstQuality: 0,
            longestSleep: 0,
            shortestSleep: 0,
          },
        },
      });
    }

    // Filter out active entries and entries without duration for stats
    const completedEntries = entries.filter(
      (entry) => !entry.isActive && entry.duration
    );

    // Calculate statistics
    const totalEntries = completedEntries.length;
    const totalDuration = completedEntries.reduce(
      (sum, entry) => sum + (entry.duration || 0),
      0
    );
    const averageDuration =
      totalEntries > 0 ? Math.round(totalDuration / totalEntries) : 0;

    const qualityEntries = completedEntries.filter(
      (entry) => entry.quality !== undefined
    );
    const totalQuality = qualityEntries.reduce(
      (sum, entry) => sum + (entry.quality || 0),
      0
    );
    const averageQuality =
      qualityEntries.length > 0
        ? Math.round(totalQuality / qualityEntries.length)
        : 0;

    // Count unique dates (days) tracked, accounting for multiple entries per date
    const totalDaysTracked = new Set(
      completedEntries.map((entry) => entry.date)
    ).size;

    const qualities = completedEntries
      .map((entry) => entry.quality)
      .filter((q) => q !== undefined);
    const bestQuality = qualities.length > 0 ? Math.max(...qualities) : 0;
    const worstQuality = qualities.length > 0 ? Math.min(...qualities) : 0;

    const durations = completedEntries
      .map((entry) => entry.duration)
      .filter((d) => d !== undefined);
    const longestSleep = durations.length > 0 ? Math.max(...durations) : 0;
    const shortestSleep = durations.length > 0 ? Math.min(...durations) : 0;

    const stats = {
      totalEntries,
      averageDuration,
      averageQuality,
      totalDaysTracked,
      bestQuality,
      worstQuality,
      longestSleep,
      shortestSleep,
    };

    res.status(200).json({
      success: true,
      message: "Sleep statistics retrieved successfully",
      data: {
        stats,
      },
    });
  } catch (error) {
    console.error("Get sleep stats error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
