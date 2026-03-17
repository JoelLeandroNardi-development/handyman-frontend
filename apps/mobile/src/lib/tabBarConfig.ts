import { type ThemeTokens } from '@smart/theme';

/**
 * Centralized tab navigator configuration
 * Eliminates duplication of tabBarStyle between UserTabs and HandymanTabs
 * Follows DRY principle - single source of truth for tab styling
 */
export const createTabBarConfig = (tokens: ThemeTokens) => ({
  tabBarStyle: {
    paddingTop: tokens.spacing.sm,
    paddingBottom: tokens.spacing.md,
    backgroundColor: tokens.colors.bg,
    borderTopWidth: 1,
    borderTopColor: tokens.colors.border,
  },
  tabBarLabelStyle: {
    fontSize: tokens.typography.labelSmall.size,
    fontWeight: tokens.typography.labelSmall.weight as any,
    marginBottom: tokens.spacing.xs,
  },
  tabBarIconStyle: {
    marginTop: tokens.spacing.xs,
  },
  tabIconContainerStyle: {
    minWidth: 34,
    height: 34,
    borderRadius: tokens.nativeRadius.pill,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
});

export type TabBarConfig = ReturnType<typeof createTabBarConfig>;
