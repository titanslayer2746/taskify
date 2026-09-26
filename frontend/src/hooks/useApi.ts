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
