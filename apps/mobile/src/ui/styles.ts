import { type ThemeTokens } from '@smart/theme';

export const createStyles = (tokens: ThemeTokens) => {
  const { colors, spacing, typography, nativeRadius, nativeShadow } = tokens;

  return {
    screen: {
      base: {
        flex: 1 as const,
        backgroundColor: colors.bg,
      },
      backgroundGradient: {
        position: 'absolute' as const,
        pointerEvents: 'none' as const,
        height: 130,
        backgroundColor: colors.primarySoft,
        opacity: 0.5,
      },
    },

    container: {
      flex: 1 as const,
      gap: spacing.md,
    },
    row: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: spacing.sm,
    },
    rowSpaceBetween: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
      gap: spacing.md,
    },
    section: {
      gap: spacing.lg,
    },

    card: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: nativeRadius.lg,
      padding: spacing.lg,
      gap: spacing.lg,
      ...nativeShadow.sm,
    },
    cardCompact: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: nativeRadius.md,
      padding: spacing.md,
      gap: spacing.md,
    },

    displayText: {
      fontSize: typography.display.size,
      lineHeight: typography.display.lineHeight,
      fontWeight: typography.display.weight as any,
      color: colors.text,
    },
    headingText: {
      fontSize: typography.heading.size,
      lineHeight: typography.heading.lineHeight,
      fontWeight: typography.heading.weight as any,
      color: colors.text,
    },
    titleText: {
      fontSize: typography.title.size,
      lineHeight: typography.title.lineHeight,
      fontWeight: typography.title.weight as any,
      color: colors.text,
    },
    subtitleText: {
      fontSize: typography.subtitle.size,
      lineHeight: typography.subtitle.lineHeight,
      fontWeight: typography.subtitle.weight as any,
      color: colors.text,
    },
    bodyText: {
      fontSize: typography.body.size,
      lineHeight: typography.body.lineHeight,
      fontWeight: typography.body.weight as any,
      color: colors.text,
    },
    bodySmallText: {
      fontSize: typography.bodySmall.size,
      lineHeight: typography.bodySmall.lineHeight,
      fontWeight: typography.bodySmall.weight as any,
      color: colors.text,
    },
    labelText: {
      fontSize: typography.label.size,
      lineHeight: typography.label.lineHeight,
      fontWeight: typography.label.weight as any,
      color: colors.text,
    },
    labelSmallText: {
      fontSize: typography.labelSmall.size,
      lineHeight: typography.labelSmall.lineHeight,
      fontWeight: typography.labelSmall.weight as any,
      color: colors.textSoft,
    },
    mutedText: {
      fontSize: typography.body.size,
      color: colors.textSoft,
    },
    faintText: {
      fontSize: typography.body.size,
      color: colors.textFaint,
    },

    formFieldGroup: {
      gap: spacing.sm,
    },
    input: {
      backgroundColor: colors.surface,
      borderRadius: nativeRadius.sm,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      color: colors.text,
      fontSize: typography.body.size,
    },
    searchBar: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      backgroundColor: colors.surface,
      borderRadius: nativeRadius.sm,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderWidth: 1,
      borderColor: colors.border,
      gap: spacing.xs,
    },

    buttonBase: {
      minHeight: 44,
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      paddingHorizontal: spacing.lg,
      borderRadius: nativeRadius.md,
    },
    buttonRow: {
      flexDirection: 'row' as const,
      gap: spacing.md,
    },

    modalBase: {
      paddingBottom: spacing.sm,
      borderTopLeftRadius: nativeRadius.lg,
      borderTopRightRadius: nativeRadius.lg,
      overflow: 'hidden' as const,
      ...nativeShadow.lg,
    },
    modalOverlay: {
      position: 'absolute' as const,
      inset: 0,
      justifyContent: 'flex-end' as const,
      backgroundColor: 'rgba(0,0,0,0.36)',
    },

    tabBarStyle: {
      paddingTop: spacing.sm,
      paddingBottom: spacing.md,
      backgroundColor: colors.bg,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    tabIconContainer: {
      minWidth: 34,
      height: 34,
      borderRadius: nativeRadius.pill,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },
    tabLabelStyle: {
      fontSize: typography.labelSmall.size,
      fontWeight: typography.labelSmall.weight as any,
      marginBottom: spacing.xs,
    },

    statusBadge: {
      minHeight: 34,
      paddingHorizontal: spacing.md,
      borderRadius: nativeRadius.pill,
      borderWidth: 1,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },

    starButton: {
      width: 44,
      height: 44,
      borderRadius: nativeRadius.md,
      borderWidth: 1,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },

    bottomSheet: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: nativeRadius.lg,
      borderTopRightRadius: nativeRadius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.lg,
      gap: spacing.md,
    },

    overlayNative: {
      position: 'absolute' as const,
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.36)',
      flexDirection: 'row' as const,
      alignItems: 'flex-end' as const,
    },

    sliderLabelRow: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
    },

    emptyState: {
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      padding: spacing.xl,
      gap: spacing.md,
    },

    notificationItem: {
      padding: spacing.md,
      borderRadius: nativeRadius.md,
      gap: spacing.sm,
    },

    listContent: {
      paddingHorizontal: spacing.lg,
      paddingBottom: 80,
      gap: spacing.sm,
    },
    listContentCompact: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      gap: spacing.md,
    },

    iconSize: {
      small: 15,
      medium: 20,
      large: 24,
    },
  };
};

export type AppStyles = ReturnType<typeof createStyles>;
