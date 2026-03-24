import { useMemo } from 'react';
import { useTheme } from '../theme';
import { createStyles, type AppStyles } from './styles';

export function useStyles(): AppStyles {
  const { tokens } = useTheme();
  return useMemo(() => createStyles(tokens), [tokens]);
}
