import { useState, useCallback } from 'react';
import { Alert } from 'react-native';

interface UseAsyncOperationOptions {
  onSuccess?: () => void;
  onError?: (message: string) => void;
  showAlert?: boolean;
  alertTitle?: string;
}

export function useAsyncOperation(options: UseAsyncOperationOptions = {}) {
  const {
    onSuccess,
    onError,
    showAlert = true,
    alertTitle = 'Error',
  } = options;

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
        
        if (showAlert) {
          Alert.alert(alertTitle, message);
        }
        
        onError?.(message);
      } finally {
        setLoading(false);
      }
    },
    [onSuccess, onError, showAlert, alertTitle]
  );

  return {
    execute,
    loading,
    error,
  };
}
