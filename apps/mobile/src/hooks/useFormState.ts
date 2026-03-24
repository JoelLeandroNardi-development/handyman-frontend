import { useCallback, useState } from 'react';

export function useFormState<T extends object>(initial: T) {
  const [data, setData] = useState<T>(initial);

  const patch = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setData(prev => ({ ...prev, [key]: value }));
  }, []);

  const reset = useCallback(() => {
    setData(initial);
  }, [initial]);

  const patchMany = useCallback((updates: Partial<T>) => {
    setData(prev => ({ ...prev, ...updates }));
  }, []);

  const patch_multiple = patchMany;

  return {
    data,
    setData,
    patch,
    patchMany,
    patch_multiple,
    reset,
  };
}
