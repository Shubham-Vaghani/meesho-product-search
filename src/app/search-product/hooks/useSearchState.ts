import { useState, useCallback, useEffect } from "react";

interface UseSearchStateOptions {
  maxRetries?: number;
  retryDelay?: number;
  maxHistoryItems?: number;
}

interface SearchState {
  searchTerm: string;
  loading: boolean;
  error: string | null;
  retryCount: number;
  showError: boolean;
  searchHistory: string[];
  isRetrying: boolean;
}

interface SearchActions {
  setSearchTerm: (term: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setShowError: (show: boolean) => void;
  addToHistory: (term: string) => void;
  clearError: () => void;
  retry: () => void;
  resetRetryCount: () => void;
}

export const useSearchState = (options: UseSearchStateOptions = {}) => {
  const { maxRetries = 3, retryDelay = 1000, maxHistoryItems = 5 } = options;

  const [state, setState] = useState<SearchState>({
    searchTerm: "",
    loading: false,
    error: null,
    retryCount: 0,
    showError: false,
    searchHistory: [],
    isRetrying: false,
  });

  // Load search history from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("meesho-search-history");
      if (saved) {
        const history = JSON.parse(saved);
        setState((prev) => ({ ...prev, searchHistory: history }));
      }
    } catch (error) {
      console.warn("Failed to load search history:", error);
    }
  }, []);

  // Save search history to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem(
        "meesho-search-history",
        JSON.stringify(state.searchHistory)
      );
    } catch (error) {
      console.warn("Failed to save search history:", error);
    }
  }, [state.searchHistory]);

  const actions: SearchActions = {
    setSearchTerm: useCallback((term: string) => {
      setState((prev) => ({ ...prev, searchTerm: term }));
    }, []),

    setLoading: useCallback((loading: boolean) => {
      setState((prev) => ({ ...prev, loading, isRetrying: false }));
    }, []),

    setError: useCallback((error: string | null) => {
      setState((prev) => ({
        ...prev,
        error,
        showError: !!error,
        retryCount: error ? prev.retryCount + 1 : prev.retryCount,
      }));
    }, []),

    setShowError: useCallback((show: boolean) => {
      setState((prev) => ({ ...prev, showError: show }));
    }, []),

    addToHistory: useCallback(
      (term: string) => {
        if (!term.trim()) return;

        setState((prev) => {
          const trimmed = term.trim();
          const newHistory = [
            trimmed,
            ...prev.searchHistory.filter((t) => t !== trimmed),
          ].slice(0, maxHistoryItems);

          return { ...prev, searchHistory: newHistory };
        });
      },
      [maxHistoryItems]
    ),

    clearError: useCallback(() => {
      setState((prev) => ({
        ...prev,
        error: null,
        showError: false,
        retryCount: 0,
        isRetrying: false,
      }));
    }, []),

    retry: useCallback(() => {
      setState((prev) => ({
        ...prev,
        isRetrying: true,
        retryCount: prev.retryCount + 1,
      }));
    }, []),

    resetRetryCount: useCallback(() => {
      setState((prev) => ({ ...prev, retryCount: 0 }));
    }, []),
  };

  const canRetry = state.retryCount < maxRetries;
  const shouldShowRetry = state.error && canRetry;

  return {
    ...state,
    ...actions,
    canRetry,
    shouldShowRetry,
    maxRetries,
    retryDelay,
  };
};

export default useSearchState;
