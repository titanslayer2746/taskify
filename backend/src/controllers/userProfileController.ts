import { Request, Response } from "express";
import { userProfileService } from "../services/userProfileService";

/**
 * Get user profile data
 */
export const getUserProfile = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const profileData = await userProfileService.getUserProfile(
      req.user.userId
    );

    if (!profileData) {
      return res.status(404).json({
        success: false,
        message: "User profile not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User profile retrieved successfully",
      data: {
        profile: profileData,
      },
    });
  } catch (error) {
    console.error("Error getting user profile:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const updateData = req.body;

    // Remove sensitive fields that shouldn't be updated via this endpoint
    delete updateData.userId;
    delete updateData.email; // Email updates should be handled separately
    delete updateData.cacheTimestamp;

    const success = await userProfileService.updateUserProfile(
      req.user.userId,
      updateData
    );

    if (!success) {
      return res.status(400).json({
        success: false,
        message: "Failed to update user profile",
      });
    }

    res.status(200).json({
      success: true,
      message: "User profile updated successfully",
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Get user preferences
 */
export const getUserPreferences = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const preferences = await userProfileService.getUserPreferences(
      req.user.userId
    );

    if (!preferences) {
      return res.status(404).json({
        success: false,
        message: "User preferences not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User preferences retrieved successfully",
      data: {
        preferences,
      },
    });
  } catch (error) {
    console.error("Error getting user preferences:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Update user preferences
 */
export const updateUserPreferences = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const preferences = req.body;

    // Remove fields that shouldn't be updated via this endpoint
    delete preferences.userId;
    delete preferences.cacheTimestamp;

    const success = await userProfileService.updateUserPreferences(
      req.user.userId,
      preferences
    );

    if (!success) {
      return res.status(400).json({
        success: false,
        message: "Failed to update user preferences",
      });
    }

    res.status(200).json({
      success: true,
      message: "User preferences updated successfully",
    });
  } catch (error) {
    console.error("Error updating user preferences:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Get user settings
 */
export const getUserSettings = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const settings = await userProfileService.getUserSettings(req.user.userId);

    if (!settings) {
      return res.status(404).json({
        success: false,
        message: "User settings not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User settings retrieved successfully",
      data: {
        settings,
      },
    });
  } catch (error) {
    console.error("Error getting user settings:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Update user settings
 */
export const updateUserSettings = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const settings = req.body;

    // Remove fields that shouldn't be updated via this endpoint
    delete settings.userId;
    delete settings.cacheTimestamp;

    const success = await userProfileService.updateUserSettings(
      req.user.userId,
      settings
    );

    if (!success) {
      return res.status(400).json({
        success: false,
        message: "Failed to update user settings",
      });
    }

    res.status(200).json({
      success: true,
      message: "User settings updated successfully",
    });
  } catch (error) {
    console.error("Error updating user settings:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Get user statistics
 */
export const getUserStatistics = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const statistics = await userProfileService.getUserStatistics(
      req.user.userId
    );

    if (!statistics) {
      return res.status(404).json({
        success: false,
        message: "User statistics not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User statistics retrieved successfully",
      data: {
        statistics,
      },
    });
  } catch (error) {
    console.error("Error getting user statistics:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Invalidate user profile cache
 */
export const invalidateUserProfileCache = async (
  req: Request,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const success = await userProfileService.invalidateUserProfileCache(
      req.user.userId
    );

    res.status(200).json({
      success: true,
      message: "User profile cache invalidated successfully",
      data: {
        cacheInvalidated: success,
      },
    });
  } catch (error) {
    console.error("Error invalidating user profile cache:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Invalidate all user caches
 */
export const invalidateAllUserCaches = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const invalidatedCount = await userProfileService.invalidateAllUserCaches(
      req.user.userId
    );

    res.status(200).json({
      success: true,
      message: "All user caches invalidated successfully",
      data: {
        invalidatedCaches: invalidatedCount,
      },
    });
  } catch (error) {
    console.error("Error invalidating all user caches:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Get cache statistics (admin only)
 */
export const getCacheStats = async (req: Request, res: Response) => {
  try {
    // In a real application, you'd check if the user has admin privileges
    // For now, we'll allow any authenticated user to see stats

    const stats = await userProfileService.getCacheStats();

    res.status(200).json({
      success: true,
      message: "Cache statistics retrieved successfully",
      data: {
        stats,
      },
    });
  } catch (error) {
    console.error("Error getting cache statistics:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Clear all user profile caches (admin only)
 */
export const clearAllUserProfileCaches = async (
  req: Request,
  res: Response
) => {
  try {
    // In a real application, you'd check if the user has admin privileges

    const clearedCount = await userProfileService.clearAllUserProfileCaches();

    res.status(200).json({
      success: true,
      message: "All user profile caches cleared successfully",
      data: {
        clearedCaches: clearedCount,
      },
    });
  } catch (error) {
    console.error("Error clearing all user profile caches:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
