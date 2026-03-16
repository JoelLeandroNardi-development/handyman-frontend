import { useState, useCallback } from 'react';

interface UseAsyncOperationOptions {
  onSuccess?: () => void;
  onError?: (message: string) => void;
}

/**
 * Custom hook to handle async operations with loading state and error handling.
 * Eliminates repetitive try-catch-finally patterns across components.
 * 
 * @param options Configuration for the async operation
 * @returns Object with execute function, loading state, and error state
 * 
 * @example
 * const { execute, loading, error } = useAsyncOperation({
 *   onSuccess: () => setData(...)
 * });
 * 
 * const handleLoad = () => execute(async () => {
 *   return await fetchData();
 * });
 */
export function useAsyncOperation(options: UseAsyncOperationOptions = {}) {
  const { onSuccess, onError } = options;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (operation: () => Promise<void>) => {
      setLoading(true);
      setError(null);
      try {
        await operation();
        onSuccess?.();
      } catch (e) {
        const message = (e as Error).message || 'An error occurred';
        setError(message);
        console.error(message);
        onError?.(message);
      } finally {
        setLoading(false);
      }
    },
    [onSuccess, onError]
  );

  return {
    execute,
    loading,
    error,
  };
}
