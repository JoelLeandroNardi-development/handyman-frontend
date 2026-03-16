import { useState, useCallback } from 'react';

interface UseAsyncOperationOptions {
  onSuccess?: () => void;
  onError?: (message: string) => void;
}

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
