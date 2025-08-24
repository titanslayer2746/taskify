// React hook for managing automatic token refresh

import { useEffect, useCallback, useRef } from "react";
import {
  tokenRefreshService,
  tokenRefreshUtils,
  TokenRefreshConfig,
  NetworkStatus,
} from "../services/token-refresh";

// Hook return type
interface UseTokenRefreshReturn {
  // Status
  isRefreshing: boolean;
  retryCount: number;
  nextRefreshIn: number | null;
  canRefresh: boolean;
  networkStatus: NetworkStatus;
  isInitialized: boolean;

  // Actions
  refreshToken: () => Promise<boolean>;
  forceRefresh: () => Promise<boolean>;
  stopRefresh: () => void;
  updateConfig: (config: Partial<TokenRefreshConfig>) => void;

  // Configuration
  config: TokenRefreshConfig;

  // Utilities
  needsRefresh: () => boolean;
  getRefreshStatus: () => ReturnType<
    typeof tokenRefreshService.getRefreshStatus
  >;
}

// Hook options
interface UseTokenRefreshOptions {
  autoRefresh?: boolean;
  refreshThreshold?: number;
  maxRetries?: number;
  retryDelay?: number;
  backgroundRefresh?: boolean;
  networkRetry?: boolean;
  silentRefresh?: boolean;
  onRefreshSuccess?: () => void;
  onRefreshError?: (error: any) => void;
  onRefreshStart?: () => void;
  onRefreshComplete?: (success: boolean) => void;
}

// Custom hook for token refresh management
export const useTokenRefresh = (
  options: UseTokenRefreshOptions = {}
): UseTokenRefreshReturn => {
  const {
    autoRefresh = true,
    refreshThreshold = 300,
    maxRetries = 3,
    retryDelay = 1000,
    backgroundRefresh = true,
    networkRetry = true,
    silentRefresh = true,
    onRefreshSuccess,
    onRefreshError,
    onRefreshStart,
    onRefreshComplete,
  } = options;

  const callbacksRef = useRef({
    onRefreshSuccess,
    onRefreshError,
    onRefreshStart,
    onRefreshComplete,
  });

  // Update callbacks ref when options change
  useEffect(() => {
    callbacksRef.current = {
      onRefreshSuccess,
      onRefreshError,
      onRefreshStart,
      onRefreshComplete,
    };
  }, [onRefreshSuccess, onRefreshError, onRefreshStart, onRefreshComplete]);

  // Initialize token refresh service
  useEffect(() => {
    const config: Partial<TokenRefreshConfig> = {
      autoRefresh,
      refreshThreshold,
      maxRetries,
      retryDelay,
      backgroundRefresh,
      networkRetry,
      silentRefresh,
    };

    tokenRefreshUtils.updateConfig(config);
    tokenRefreshUtils.initialize();

    // Cleanup on unmount
    return () => {
      tokenRefreshUtils.stop();
    };
  }, [
    autoRefresh,
    refreshThreshold,
    maxRetries,
    retryDelay,
    backgroundRefresh,
    networkRetry,
    silentRefresh,
  ]);

  // Setup refresh callbacks
  useEffect(() => {
    const unsubscribe = tokenRefreshUtils.onRefresh((success) => {
      const { onRefreshComplete, onRefreshSuccess, onRefreshError } =
        callbacksRef.current;

      if (success) {
        onRefreshSuccess?.();
      } else {
        onRefreshError?.(new Error("Token refresh failed"));
      }

      onRefreshComplete?.(success);
    });

    return unsubscribe;
  }, []);

  // Refresh token function
  const refreshToken = useCallback(async (): Promise<boolean> => {
    const { onRefreshStart } = callbacksRef.current;
    onRefreshStart?.();

    try {
      const success = await tokenRefreshUtils.forceRefresh();
      return success;
    } catch (error) {
      const { onRefreshError } = callbacksRef.current;
      onRefreshError?.(error);
      throw error;
    }
  }, []);

  // Force refresh function
  const forceRefresh = useCallback(async (): Promise<boolean> => {
    const { onRefreshStart } = callbacksRef.current;
    onRefreshStart?.();

    try {
      const success = await tokenRefreshUtils.forceRefresh();
      return success;
    } catch (error) {
      const { onRefreshError } = callbacksRef.current;
      onRefreshError?.(error);
      throw error;
    }
  }, []);

  // Stop refresh function
  const stopRefresh = useCallback((): void => {
    tokenRefreshUtils.stop();
  }, []);

  // Update configuration function
  const updateConfig = useCallback(
    (config: Partial<TokenRefreshConfig>): void => {
      tokenRefreshUtils.updateConfig(config);
    },
    []
  );

  // Check if token needs refresh
  const needsRefresh = useCallback((): boolean => {
    return tokenRefreshService.needsRefresh();
  }, []);

  // Get refresh status
  const getRefreshStatus = useCallback(() => {
    return tokenRefreshService.getRefreshStatus();
  }, []);

  // Get current status
  const status = getRefreshStatus();

  return {
    // Status
    isRefreshing: status.isRefreshing,
    retryCount: status.retryCount,
    nextRefreshIn: status.nextRefreshIn,
    canRefresh: status.canRefresh,
    networkStatus: status.networkStatus,
    isInitialized: status.isInitialized,

    // Actions
    refreshToken,
    forceRefresh,
    stopRefresh,
    updateConfig,

    // Configuration
    config: tokenRefreshUtils.getConfig(),

    // Utilities
    needsRefresh,
    getRefreshStatus,
  };
};

// Hook for automatic token refresh with minimal configuration
export const useAutoTokenRefresh = (enabled: boolean = true) => {
  return useTokenRefresh({
    autoRefresh: enabled,
    refreshThreshold: 300, // 5 minutes
    maxRetries: 3,
    retryDelay: 1000,
    backgroundRefresh: true,
    networkRetry: true,
    silentRefresh: true,
  });
};

// Hook for manual token refresh
export const useManualTokenRefresh = () => {
  return useTokenRefresh({
    autoRefresh: false,
    backgroundRefresh: false,
    networkRetry: false,
    silentRefresh: false,
  });
};

// Hook for background token refresh
export const useBackgroundTokenRefresh = () => {
  return useTokenRefresh({
    autoRefresh: true,
    backgroundRefresh: true,
    networkRetry: true,
    silentRefresh: true,
    refreshThreshold: 600, // 10 minutes for background
  });
};

// Hook for network-aware token refresh
export const useNetworkAwareTokenRefresh = () => {
  return useTokenRefresh({
    autoRefresh: true,
    networkRetry: true,
    backgroundRefresh: false,
    silentRefresh: true,
    refreshThreshold: 300,
  });
};

// Hook for token refresh status only
export const useTokenRefreshStatus = () => {
  const {
    isRefreshing,
    retryCount,
    nextRefreshIn,
    canRefresh,
    networkStatus,
    isInitialized,
  } = useTokenRefresh({
    autoRefresh: false, // Don't start auto-refresh, just monitor status
  });

  return {
    isRefreshing,
    retryCount,
    nextRefreshIn,
    canRefresh,
    networkStatus,
    isInitialized,
  };
};

// Hook for token refresh with custom callbacks
export const useTokenRefreshWithCallbacks = (callbacks: {
  onRefreshSuccess?: () => void;
  onRefreshError?: (error: any) => void;
  onRefreshStart?: () => void;
  onRefreshComplete?: (success: boolean) => void;
}) => {
  return useTokenRefresh({
    autoRefresh: true,
    refreshThreshold: 300,
    maxRetries: 3,
    retryDelay: 1000,
    backgroundRefresh: true,
    networkRetry: true,
    silentRefresh: true,
    ...callbacks,
  });
};
