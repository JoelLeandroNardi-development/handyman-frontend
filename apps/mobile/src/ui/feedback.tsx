import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTheme } from '../theme';
import { useStyles } from './useStyles';

type BadgeTone = 'success' | 'warning' | 'danger' | 'neutral' | 'info';

export function StatusBadge({
  label,
  tone = 'neutral',
}: {
  label: string;
  tone?: BadgeTone;
}) {
  const { colors, tokens } = useTheme();
  const styles = useStyles();

  const palette = (() => {
    switch (tone) {
      case 'success':
        return {
          backgroundColor: colors.successSoft,
          borderColor: colors.success,
          textColor: colors.success,
        };
      case 'warning':
        return {
          backgroundColor: colors.warningSoft,
          borderColor: colors.warning,
          textColor: colors.warning,
        };
      case 'danger':
        return {
          backgroundColor: colors.dangerSoft,
          borderColor: colors.danger,
          textColor: colors.danger,
        };
      case 'info':
        return {
          backgroundColor: colors.primarySoft,
          borderColor: colors.primary,
          textColor: colors.primary,
        };
      default:
        return {
          backgroundColor: colors.surfaceMuted,
          borderColor: colors.border,
          textColor: colors.textSoft,
        };
    }
  })();

  return (
    <View
      style={[
        styles.statusBadge,
        {
          borderColor: palette.borderColor,
          backgroundColor: palette.backgroundColor,
        },
      ]}>
      <Text
        style={{
          color: palette.textColor,
          fontSize: tokens.typography.labelSmall.size,
          fontWeight: '800',
        }}>
        {label}
      </Text>
    </View>
  );
}

export function SkillChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const { colors, tokens } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingHorizontal: tokens.spacing.md,
        paddingVertical: tokens.spacing.sm + 3,
        borderRadius: tokens.nativeRadius.pill,
        borderWidth: 1,
        borderColor: selected ? colors.primary : colors.border,
        backgroundColor: selected ? colors.primarySoft : colors.surface,
      }}>
      <Text
        style={{
          color: selected ? colors.primary : colors.text,
          fontWeight: '700',
          fontSize: tokens.typography.body.size,
        }}>
        {label}
      </Text>
    </Pressable>
  );
}
