// Custom hook for API operations with loading and error states

import { useState, useCallback, useRef } from "react";
import { ApiError } from "../services/types";

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
}

interface UseApiReturn<T> extends UseApiState<T> {
  execute: (...args: any[]) => Promise<T | null>;
  reset: () => void;
  setData: (data: T | null) => void;
  setError: (error: ApiError | null) => void;
}

export function useApi<T = any>(
  apiFunction: (...args: any[]) => Promise<T>
): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  // Use useRef to store the apiFunction to prevent unnecessary re-renders
  const apiFunctionRef = useRef(apiFunction);
  apiFunctionRef.current = apiFunction;

  const execute = useCallback(
    async (...args: any[]): Promise<T | null> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const result = await apiFunctionRef.current(...args);
        setState((prev) => ({ ...prev, data: result, loading: false }));
        return result;
      } catch (error) {
        const apiError = error as ApiError;
        setState((prev) => ({ ...prev, error: apiError, loading: false }));
        return null;
      }
    },
    [] // Remove apiFunction from dependencies
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  const setData = useCallback((data: T | null) => {
    setState((prev) => ({ ...prev, data }));
  }, []);

  const setError = useCallback((error: ApiError | null) => {
    setState((prev) => ({ ...prev, error }));
  }, []);

  return {
    ...state,
    execute,
    reset,
    setData,
    setError,
  };
}

// Hook for optimistic updates
export function useOptimisticApi<T = any>(
  apiFunction: (...args: any[]) => Promise<T>,
  optimisticUpdate?: (data: T) => void
): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  // Use useRef to store the functions to prevent unnecessary re-renders
  const apiFunctionRef = useRef(apiFunction);
  const optimisticUpdateRef = useRef(optimisticUpdate);
  apiFunctionRef.current = apiFunction;
  optimisticUpdateRef.current = optimisticUpdate;

  const execute = useCallback(
    async (...args: any[]): Promise<T | null> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const result = await apiFunctionRef.current(...args);
        setState((prev) => ({ ...prev, data: result, loading: false }));

        // Apply optimistic update if provided
        if (optimisticUpdateRef.current) {
          optimisticUpdateRef.current(result);
        }

        return result;
      } catch (error) {
        const apiError = error as ApiError;
        setState((prev) => ({ ...prev, error: apiError, loading: false }));
        return null;
      }
    },
    [] // Remove dependencies
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  const setData = useCallback((data: T | null) => {
    setState((prev) => ({ ...prev, data }));
  }, []);

  const setError = useCallback((error: ApiError | null) => {
    setState((prev) => ({ ...prev, error }));
  }, []);

  return {
    ...state,
    execute,
    reset,
    setData,
    setError,
  };
}

// Hook for data fetching with automatic retry
export function useApiWithRetry<T = any>(
  apiFunction: (...args: any[]) => Promise<T>,
  maxRetries: number = 3,
  retryDelay: number = 1000
): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  // Use useRef to store the function and parameters to prevent unnecessary re-renders
  const apiFunctionRef = useRef(apiFunction);
  const maxRetriesRef = useRef(maxRetries);
  const retryDelayRef = useRef(retryDelay);
  apiFunctionRef.current = apiFunction;
  maxRetriesRef.current = maxRetries;
  retryDelayRef.current = retryDelay;

  const execute = useCallback(
    async (...args: any[]): Promise<T | null> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      let lastError: ApiError | null = null;

      for (let attempt = 1; attempt <= maxRetriesRef.current; attempt++) {
        try {
          const result = await apiFunctionRef.current(...args);
          setState((prev) => ({ ...prev, data: result, loading: false }));
          return result;
        } catch (error) {
          lastError = error as ApiError;

          // Don't retry on certain error types
          if (
            lastError.type === "AUTH_ERROR" ||
            lastError.type === "VALIDATION_ERROR"
          ) {
            break;
          }

          // Wait before retrying (except on last attempt)
          if (attempt < maxRetriesRef.current) {
            await new Promise((resolve) =>
              setTimeout(resolve, retryDelayRef.current * attempt)
            );
          }
        }
      }

      setState((prev) => ({ ...prev, error: lastError, loading: false }));
      return null;
    },
    [] // Remove dependencies
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  const setData = useCallback((data: T | null) => {
    setState((prev) => ({ ...prev, data }));
  }, []);

  const setError = useCallback((error: ApiError | null) => {
    setState((prev) => ({ ...prev, error }));
  }, []);

  return {
    ...state,
    execute,
    reset,
    setData,
    setError,
  };
}
