import { useMemo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type UseBottomGuardOptions = {
  minGuardHeight?: number;
  extraInset?: number;
  contentPadding?: number;
};

export function useBottomGuard(options: UseBottomGuardOptions = {}) {
  const {
    minGuardHeight = 40,
    extraInset = 12,
    contentPadding = 24,
  } = options;
  const insets = useSafeAreaInsets();

  return useMemo(
    () => ({
      bottomGuardHeight: Math.max(insets.bottom + extraInset, minGuardHeight),
      bottomContentPadding: contentPadding,
    }),
    [contentPadding, extraInset, insets.bottom, minGuardHeight],
  );
}