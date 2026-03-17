import { useMemo } from 'react';
import { useTheme } from '../theme';
import { createStyles, type AppStyles } from './styles';

/**
 * Hook to access centralized styles
 * Ensures all components use consistent design tokens
 */
export function useStyles(): AppStyles {
  const { tokens } = useTheme();
  return useMemo(() => createStyles(tokens), [tokens]);
}
