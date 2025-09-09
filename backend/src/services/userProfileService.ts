import { redisUtils } from "../config/redis";
import { User } from "../models/User";

// User profile data interface
export interface UserProfileData {
  userId: string;
  email: string;
  name: string;
  isActive: boolean;
  lastLogin: Date;
  createdAt: Date;
  updatedAt: Date;
  profilePicture?: string;
  bio?: string;
  timezone?: string;
  language?: string;
  theme?: string;
  notifications?: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  privacy?: {
    profileVisibility: "public" | "private" | "friends";
    showEmail: boolean;
    showLastLogin: boolean;
  };
  preferences?: {
    defaultView: "dashboard" | "calendar" | "list";
    dateFormat: string;
    timeFormat: "12h" | "24h";
    weekStart: "sunday" | "monday";
  };
  settings?: {
    autoSave: boolean;
    darkMode: boolean;
    compactMode: boolean;
    animations: boolean;
  };
  statistics?: {
    totalHabits: number;
    totalTodos: number;
    totalJournalEntries: number;
    streakDays: number;
    lastActivity: Date;
  };
  cacheTimestamp: number;
}

// User preferences interface
export interface UserPreferences {
  userId: string;
  theme: "light" | "dark" | "auto";
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: "12h" | "24h";
  weekStart: "sunday" | "monday";
  defaultView: "dashboard" | "calendar" | "list";
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    habits: boolean;
    todos: boolean;
    journal: boolean;
  };
  privacy: {
    profileVisibility: "public" | "private" | "friends";
    showEmail: boolean;
    showLastLogin: boolean;
    showStatistics: boolean;
  };
  display: {
    compactMode: boolean;
    animations: boolean;
    autoSave: boolean;
    showTooltips: boolean;
  };
  cacheTimestamp: number;
}

// User settings interface
export interface UserSettings {
  userId: string;
  general: {
    autoSave: boolean;
    autoBackup: boolean;
    syncAcrossDevices: boolean;
  };
  appearance: {
    theme: "light" | "dark" | "auto";
    compactMode: boolean;
    animations: boolean;
    fontSize: "small" | "medium" | "large";
  };
  behavior: {
    confirmDeletions: boolean;
    showWelcomeTips: boolean;
    rememberFilters: boolean;
  };
  security: {
    twoFactorEnabled: boolean;
    sessionTimeout: number; // in minutes
    loginNotifications: boolean;
  };
  cacheTimestamp: number;
}

// User statistics interface
export interface UserStatistics {
  userId: string;
  habits: {
    total: number;
    active: number;
    completed: number;
    streak: number;
  };
  todos: {
    total: number;
    completed: number;
    pending: number;
    overdue: number;
  };
  journal: {
    totalEntries: number;
    thisWeek: number;
    thisMonth: number;
  };
  activity: {
    lastLogin: Date;
    totalLogins: number;
    streakDays: number;
    averageSessionTime: number;
  };
  cacheTimestamp: number;
}

class UserProfileService {
  private readonly PROFILE_PREFIX = "profile:";
  private readonly PREFERENCES_PREFIX = "preferences:";
  private readonly SETTINGS_PREFIX = "settings:";
  private readonly STATISTICS_PREFIX = "statistics:";
  private readonly PROFILE_CACHE_TTL = 15 * 60; // 15 minutes
  private readonly PREFERENCES_CACHE_TTL = 30 * 60; // 30 minutes
  private readonly SETTINGS_CACHE_TTL = 60 * 60; // 1 hour
  private readonly STATISTICS_CACHE_TTL = 5 * 60; // 5 minutes

  /**
   * Get user profile data with caching
   */
  async getUserProfile(userId: string): Promise<UserProfileData | null> {
    try {
      const cacheKey = `${this.PROFILE_PREFIX}${userId}`;

      // Try to get from cache first
      let profileData = await redisUtils.getJson<UserProfileData>(cacheKey);

      if (profileData) {
        console.log(
          `📖 PROFILE CACHE HIT: Profile data cached for user ${userId}`
        );
        return profileData;
      }

      console.log(
        `❌ PROFILE CACHE MISS: Profile data not cached for user ${userId}, fetching from database`
      );

      // Fetch from database
      const user = await User.findById(userId).select("-password");
      if (!user) {
        return null;
      }

      // Build comprehensive profile data
      profileData = {
        userId: user._id.toString(),
        email: user.email,
        name: user.name,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        profilePicture: (user as any).profilePicture,
        bio: (user as any).bio,
        timezone: (user as any).timezone,
        language: (user as any).language,
        theme: (user as any).theme,
        notifications: (user as any).notifications || {
          email: true,
          push: true,
          sms: false,
        },
        privacy: (user as any).privacy || {
          profileVisibility: "private",
          showEmail: false,
          showLastLogin: false,
        },
        preferences: (user as any).preferences || {
          defaultView: "dashboard",
          dateFormat: "MM/DD/YYYY",
          timeFormat: "12h",
          weekStart: "sunday",
        },
        settings: (user as any).settings || {
          autoSave: true,
          darkMode: false,
          compactMode: false,
          animations: true,
        },
        statistics: await this.getUserStatisticsForProfile(userId),
        cacheTimestamp: Date.now(),
      };

      // Cache the profile data
      await redisUtils.setJson(cacheKey, profileData, this.PROFILE_CACHE_TTL);
      console.log(`💾 PROFILE CACHED: Profile data cached for user ${userId}`);

      return profileData;
    } catch (error) {
      console.error(`Error getting user profile for ${userId}:`, error);
      return null;
    }
  }

  /**
   * Update user profile and invalidate cache
   */
  async updateUserProfile(
    userId: string,
    updateData: Partial<UserProfileData>
  ): Promise<boolean> {
    try {
      // Update in database
      const user = await User.findByIdAndUpdate(
        userId,
        { $set: updateData },
        { new: true, runValidators: true }
      );

      if (!user) {
        return false;
      }

      // Invalidate profile cache
      await this.invalidateUserProfileCache(userId);

      // Also invalidate related caches
      await this.invalidateUserPreferencesCache(userId);
      await this.invalidateUserSettingsCache(userId);
      await this.invalidateUserStatisticsCache(userId);

      console.log(
        `🔄 PROFILE UPDATED: Profile updated and cache invalidated for user ${userId}`
      );
      return true;
    } catch (error) {
      console.error(`Error updating user profile for ${userId}:`, error);
      return false;
    }
  }

  /**
   * Get user preferences with caching
   */
  async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    try {
      const cacheKey = `${this.PREFERENCES_PREFIX}${userId}`;

      // Try to get from cache first
      let preferences = await redisUtils.getJson<UserPreferences>(cacheKey);

      if (preferences) {
        console.log(
          `📖 PREFERENCES CACHE HIT: Preferences cached for user ${userId}`
        );
        return preferences;
      }

      console.log(
        `❌ PREFERENCES CACHE MISS: Preferences not cached for user ${userId}, fetching from database`
      );

      // Fetch from database
      const user = await User.findById(userId).select(
        "preferences theme language timezone"
      );
      if (!user) {
        return null;
      }

      // Build preferences data
      preferences = {
        userId: user._id.toString(),
        theme: (user as any).theme || "auto",
        language: (user as any).language || "en",
        timezone: (user as any).timezone || "UTC",
        dateFormat: (user as any).preferences?.dateFormat || "MM/DD/YYYY",
        timeFormat: (user as any).preferences?.timeFormat || "12h",
        weekStart: (user as any).preferences?.weekStart || "sunday",
        defaultView: (user as any).preferences?.defaultView || "dashboard",
        notifications: (user as any).preferences?.notifications || {
          email: true,
          push: true,
          sms: false,
          habits: true,
          todos: true,
          journal: true,
        },
        privacy: (user as any).preferences?.privacy || {
          profileVisibility: "private",
          showEmail: false,
          showLastLogin: false,
          showStatistics: false,
        },
        display: (user as any).preferences?.display || {
          compactMode: false,
          animations: true,
          autoSave: true,
          showTooltips: true,
        },
        cacheTimestamp: Date.now(),
      };

      // Cache the preferences
      await redisUtils.setJson(
        cacheKey,
        preferences,
        this.PREFERENCES_CACHE_TTL
      );
      console.log(
        `💾 PREFERENCES CACHED: Preferences cached for user ${userId}`
      );

      return preferences;
    } catch (error) {
      console.error(`Error getting user preferences for ${userId}:`, error);
      return null;
    }
  }

  /**
   * Update user preferences and invalidate cache
   */
  async updateUserPreferences(
    userId: string,
    preferences: Partial<UserPreferences>
  ): Promise<boolean> {
    try {
      // Update in database
      const user = await User.findByIdAndUpdate(
        userId,
        { $set: { preferences } },
        { new: true, runValidators: true }
      );

      if (!user) {
        return false;
      }

      // Invalidate preferences cache
      await this.invalidateUserPreferencesCache(userId);

      // Also invalidate profile cache since preferences are part of profile
      await this.invalidateUserProfileCache(userId);

      console.log(
        `🔄 PREFERENCES UPDATED: Preferences updated and cache invalidated for user ${userId}`
      );
      return true;
    } catch (error) {
      console.error(`Error updating user preferences for ${userId}:`, error);
      return false;
    }
  }

  /**
   * Get user settings with caching
   */
  async getUserSettings(userId: string): Promise<UserSettings | null> {
    try {
      const cacheKey = `${this.SETTINGS_PREFIX}${userId}`;

      // Try to get from cache first
      let settings = await redisUtils.getJson<UserSettings>(cacheKey);

      if (settings) {
        console.log(
          `📖 SETTINGS CACHE HIT: Settings cached for user ${userId}`
        );
        return settings;
      }

      console.log(
        `❌ SETTINGS CACHE MISS: Settings not cached for user ${userId}, fetching from database`
      );

      // Fetch from database
      const user = await User.findById(userId).select("settings");
      if (!user) {
        return null;
      }

      // Build settings data
      settings = {
        userId: user._id.toString(),
        general: (user as any).settings?.general || {
          autoSave: true,
          autoBackup: false,
          syncAcrossDevices: true,
        },
        appearance: (user as any).settings?.appearance || {
          theme: "auto",
          compactMode: false,
          animations: true,
          fontSize: "medium",
        },
        behavior: (user as any).settings?.behavior || {
          confirmDeletions: true,
          showWelcomeTips: true,
          rememberFilters: true,
        },
        security: (user as any).settings?.security || {
          twoFactorEnabled: false,
          sessionTimeout: 30,
          loginNotifications: true,
        },
        cacheTimestamp: Date.now(),
      };

      // Cache the settings
      await redisUtils.setJson(cacheKey, settings, this.SETTINGS_CACHE_TTL);
      console.log(`💾 SETTINGS CACHED: Settings cached for user ${userId}`);

      return settings;
    } catch (error) {
      console.error(`Error getting user settings for ${userId}:`, error);
      return null;
    }
  }

  /**
   * Update user settings and invalidate cache
   */
  async updateUserSettings(
    userId: string,
    settings: Partial<UserSettings>
  ): Promise<boolean> {
    try {
      // Update in database
      const user = await User.findByIdAndUpdate(
        userId,
        { $set: { settings } },
        { new: true, runValidators: true }
      );

      if (!user) {
        return false;
      }

      // Invalidate settings cache
      await this.invalidateUserSettingsCache(userId);

      // Also invalidate profile cache since settings are part of profile
      await this.invalidateUserProfileCache(userId);

      console.log(
        `🔄 SETTINGS UPDATED: Settings updated and cache invalidated for user ${userId}`
      );
      return true;
    } catch (error) {
      console.error(`Error updating user settings for ${userId}:`, error);
      return false;
    }
  }

  /**
   * Get user statistics with caching
   */
  async getUserStatistics(userId: string): Promise<UserStatistics | null> {
    try {
      const cacheKey = `${this.STATISTICS_PREFIX}${userId}`;

      // Try to get from cache first
      let statistics = await redisUtils.getJson<UserStatistics>(cacheKey);

      if (statistics) {
        console.log(
          `📖 STATISTICS CACHE HIT: Statistics cached for user ${userId}`
        );
        return statistics;
      }

      console.log(
        `❌ STATISTICS CACHE MISS: Statistics not cached for user ${userId}, calculating from database`
      );

      // Calculate statistics from database
      // Note: This would require importing other models and calculating actual statistics
      // For now, we'll create a basic structure
      const user = await User.findById(userId);
      if (!user) {
        return null;
      }

      statistics = {
        userId: user._id.toString(),
        habits: {
          total: 0, // Would calculate from Habit model
          active: 0,
          completed: 0,
          streak: 0,
        },
        todos: {
          total: 0, // Would calculate from Todo model
          completed: 0,
          pending: 0,
          overdue: 0,
        },
        journal: {
          totalEntries: 0, // Would calculate from Journal model
          thisWeek: 0,
          thisMonth: 0,
        },
        activity: {
          lastLogin: user.lastLogin,
          totalLogins: 0, // Would calculate from login history
          streakDays: 0,
          averageSessionTime: 0,
        },
        cacheTimestamp: Date.now(),
      };

      // Cache the statistics
      await redisUtils.setJson(cacheKey, statistics, this.STATISTICS_CACHE_TTL);
      console.log(`💾 STATISTICS CACHED: Statistics cached for user ${userId}`);

      return statistics;
    } catch (error) {
      console.error(`Error getting user statistics for ${userId}:`, error);
      return null;
    }
  }

  /**
   * Get user statistics for profile data (simplified format)
   */
  async getUserStatisticsForProfile(userId: string): Promise<{
    totalHabits: number;
    totalTodos: number;
    totalJournalEntries: number;
    streakDays: number;
    lastActivity: Date;
  } | null> {
    try {
      const fullStatistics = await this.getUserStatistics(userId);
      if (!fullStatistics) {
        return null;
      }

      return {
        totalHabits: fullStatistics.habits.total,
        totalTodos: fullStatistics.todos.total,
        totalJournalEntries: fullStatistics.journal.totalEntries,
        streakDays: fullStatistics.activity.streakDays,
        lastActivity: fullStatistics.activity.lastLogin,
      };
    } catch (error) {
      console.error(`Error getting user statistics for profile for ${userId}:`, error);
      return null;
    }
  }

  /**
   * Invalidate user profile cache
   */
  async invalidateUserProfileCache(userId: string): Promise<boolean> {
    try {
      const cacheKey = `${this.PROFILE_PREFIX}${userId}`;
      const deleted = await redisUtils.del(cacheKey);

      if (deleted) {
        console.log(
          `🗑️ PROFILE CACHE INVALIDATED: Profile cache cleared for user ${userId}`
        );
      }

      return deleted;
    } catch (error) {
      console.error(
        `Error invalidating profile cache for user ${userId}:`,
        error
      );
      return false;
    }
  }

  /**
   * Invalidate user preferences cache
   */
  async invalidateUserPreferencesCache(userId: string): Promise<boolean> {
    try {
      const cacheKey = `${this.PREFERENCES_PREFIX}${userId}`;
      const deleted = await redisUtils.del(cacheKey);

      if (deleted) {
        console.log(
          `🗑️ PREFERENCES CACHE INVALIDATED: Preferences cache cleared for user ${userId}`
        );
      }

      return deleted;
    } catch (error) {
      console.error(
        `Error invalidating preferences cache for user ${userId}:`,
        error
      );
      return false;
    }
  }

  /**
   * Invalidate user settings cache
   */
  async invalidateUserSettingsCache(userId: string): Promise<boolean> {
    try {
      const cacheKey = `${this.SETTINGS_PREFIX}${userId}`;
      const deleted = await redisUtils.del(cacheKey);

      if (deleted) {
        console.log(
          `🗑️ SETTINGS CACHE INVALIDATED: Settings cache cleared for user ${userId}`
        );
      }

      return deleted;
    } catch (error) {
      console.error(
        `Error invalidating settings cache for user ${userId}:`,
        error
      );
      return false;
    }
  }

  /**
   * Invalidate user statistics cache
   */
  async invalidateUserStatisticsCache(userId: string): Promise<boolean> {
    try {
      const cacheKey = `${this.STATISTICS_PREFIX}${userId}`;
      const deleted = await redisUtils.del(cacheKey);

      if (deleted) {
        console.log(
          `🗑️ STATISTICS CACHE INVALIDATED: Statistics cache cleared for user ${userId}`
        );
      }

      return deleted;
    } catch (error) {
      console.error(
        `Error invalidating statistics cache for user ${userId}:`,
        error
      );
      return false;
    }
  }

  /**
   * Invalidate all user caches
   */
  async invalidateAllUserCaches(userId: string): Promise<number> {
    try {
      const results = await Promise.all([
        this.invalidateUserProfileCache(userId),
        this.invalidateUserPreferencesCache(userId),
        this.invalidateUserSettingsCache(userId),
        this.invalidateUserStatisticsCache(userId),
      ]);

      const invalidatedCount = results.filter(Boolean).length;
      console.log(
        `🗑️ ALL USER CACHES INVALIDATED: ${invalidatedCount} caches cleared for user ${userId}`
      );

      return invalidatedCount;
    } catch (error) {
      console.error(`Error invalidating all caches for user ${userId}:`, error);
      return 0;
    }
  }

  /**
   * Get cache statistics for user profile system
   */
  async getCacheStats(): Promise<{
    profileCaches: number;
    preferencesCaches: number;
    settingsCaches: number;
    statisticsCaches: number;
    totalCaches: number;
  }> {
    try {
      const [profileKeys, preferencesKeys, settingsKeys, statisticsKeys] =
        await Promise.all([
          redisUtils.keys(`${this.PROFILE_PREFIX}*`),
          redisUtils.keys(`${this.PREFERENCES_PREFIX}*`),
          redisUtils.keys(`${this.SETTINGS_PREFIX}*`),
          redisUtils.keys(`${this.STATISTICS_PREFIX}*`),
        ]);

      return {
        profileCaches: profileKeys.length,
        preferencesCaches: preferencesKeys.length,
        settingsCaches: settingsKeys.length,
        statisticsCaches: statisticsKeys.length,
        totalCaches:
          profileKeys.length +
          preferencesKeys.length +
          settingsKeys.length +
          statisticsKeys.length,
      };
    } catch (error) {
      console.error("Error getting cache statistics:", error);
      return {
        profileCaches: 0,
        preferencesCaches: 0,
        settingsCaches: 0,
        statisticsCaches: 0,
        totalCaches: 0,
      };
    }
  }

  /**
   * Clear all user profile caches
   */
  async clearAllUserProfileCaches(): Promise<number> {
    try {
      const [profileKeys, preferencesKeys, settingsKeys, statisticsKeys] =
        await Promise.all([
          redisUtils.keys(`${this.PROFILE_PREFIX}*`),
          redisUtils.keys(`${this.PREFERENCES_PREFIX}*`),
          redisUtils.keys(`${this.SETTINGS_PREFIX}*`),
          redisUtils.keys(`${this.STATISTICS_PREFIX}*`),
        ]);

      const allKeys = [
        ...profileKeys,
        ...preferencesKeys,
        ...settingsKeys,
        ...statisticsKeys,
      ];

      if (allKeys.length === 0) {
        console.log("No user profile caches found to clear");
        return 0;
      }

      const results = await Promise.all(
        allKeys.map((key) => redisUtils.del(key))
      );
      const deletedCount = results.filter(Boolean).length;

      console.log(
        `🗑️ ALL USER PROFILE CACHES CLEARED: ${deletedCount} caches cleared`
      );
      return deletedCount;
    } catch (error) {
      console.error("Error clearing all user profile caches:", error);
      return 0;
    }
  }
}

// Export singleton instance
export const userProfileService = new UserProfileService();
export default userProfileService;
