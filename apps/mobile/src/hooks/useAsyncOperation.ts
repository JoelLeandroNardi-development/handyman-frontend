import { useCallback, useState } from 'react';
import { Alert } from 'react-native';

interface UseAsyncOperationOptions<T = void> {
  onSuccess?: (result?: T) => void;
  onError?: (error: Error) => void;
  onRetryableError?: (error: Error) => boolean;
  showAlert?: boolean;
  alertTitle?: string;
  maxRetries?: number;
  retryDelay?: number;
}

export function useAsyncOperation<T = void>(
  options: UseAsyncOperationOptions<T> = {},
) {
  const {
    onSuccess,
    onError,
    onRetryableError,
    showAlert = true,
    alertTitle = 'Error',
    maxRetries = 0,
    retryDelay = 1000,
  } = options;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (operation: () => Promise<T>): Promise<T | undefined> => {
      setLoading(true);
      setError(null);

      let lastError: Error | null = null;
      let retryCount = 0;

      while (retryCount <= maxRetries) {
        try {
          const result = await operation();
          setLoading(false);
          onSuccess?.(result);
          return result;
        } catch (e) {
          lastError = e as Error;
          const message = (e as Error).message || 'An error occurred';

          const isRetryable = onRetryableError?.(lastError) ?? false;

          if (isRetryable && retryCount < maxRetries) {
            retryCount++;
            await new Promise(resolve =>
              setTimeout(resolve, retryDelay * retryCount),
            );
            continue;
          }

          setError(message);

          if (showAlert) {
            Alert.alert(alertTitle, message);
          }

          onError?.(lastError);
          setLoading(false);
          return undefined;
        }
      }

      return undefined;
    },
    [
      onSuccess,
      onError,
      onRetryableError,
      showAlert,
      alertTitle,
      maxRetries,
      retryDelay,
    ],
  );

  return {
    execute,
    loading,
    error,
  };
}
