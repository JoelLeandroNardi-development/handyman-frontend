import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '../theme';
import { useStyles } from './useStyles';

export function AppInput(props: TextInputProps) {
  const { colors, tokens } = useTheme();
  const styles = useStyles();

  return (
    <TextInput
      placeholderTextColor={colors.textFaint}
      selectionColor={colors.primary}
      {...props}
      style={[
        styles.input,
        {
          minHeight: 54,
          paddingHorizontal: tokens.spacing.lg,
          paddingVertical: tokens.spacing.md,
        },
        props.style,
      ]}
    />
  );
}

export function InputButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  const { tokens } = useTheme();
  const styles = useStyles();

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.input,
        {
          minHeight: 52,
          paddingHorizontal: tokens.spacing.md,
          paddingVertical: tokens.spacing.md,
          justifyContent: 'center',
        },
      ]}>
      <Text style={[styles.bodyText]}>{label}</Text>
    </Pressable>
  );
}

export function Label({ children }: { children: React.ReactNode }) {
  const styles = useStyles();
  return <Text style={styles.labelText}>{children}</Text>;
}

type ButtonTone = 'primary' | 'secondary' | 'danger' | 'surface';

function getButtonColors(
  tone: ButtonTone,
  colors: ReturnType<typeof useTheme>['colors'],
) {
  switch (tone) {
    case 'primary':
      return {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
        textColor: '#ffffff',
      };
    case 'danger':
      return {
        backgroundColor: colors.danger,
        borderColor: colors.danger,
        textColor: '#ffffff',
      };
    case 'secondary':
      return {
        backgroundColor: colors.surfaceMuted,
        borderColor: colors.border,
        textColor: colors.text,
      };
    default:
      return {
        backgroundColor: colors.surface,
        borderColor: colors.border,
        textColor: colors.text,
      };
  }
}

export function AppButton({
  label,
  onPress,
  tone = 'primary',
  disabled = false,
  loading = false,
  style,
}: {
  label: string;
  onPress: () => void;
  tone?: ButtonTone;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors, tokens } = useTheme();
  const styles = useStyles();
  const palette = getButtonColors(tone, colors);

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.buttonBase,
        {
          minHeight: 56,
          borderColor: palette.borderColor,
          backgroundColor: disabled ? colors.border : palette.backgroundColor,
          ...tokens.nativeShadow[tone === 'primary' ? 'md' : 'sm'],
        },
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={palette.textColor} />
      ) : (
        <Text
          style={{
            color: disabled ? colors.textSoft : palette.textColor,
            fontSize: tokens.typography.subtitle.size,
            fontWeight: '800',
          }}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

export function ButtonRow({ children }: { children: React.ReactNode }) {
  const { tokens } = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: tokens.spacing.lg }}>
      {children}
    </View>
  );
}
