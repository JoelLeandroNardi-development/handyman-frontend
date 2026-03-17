import { useCallback, useState } from 'react';

/**
 * Generic form state management hook that reduces boilerplate
 * from multiple individual useState hooks to a single state object.
 *
 * @example
 * const { data, patch, reset } = useFormState({ name: '', email: '' });
 * <TextInput value={data.name} onChangeText={(v) => patch('name', v)} />
 */
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

  // Backward-compatible alias.
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
