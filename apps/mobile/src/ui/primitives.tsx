import React from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '../theme';
import { useStyles } from './useStyles';

function getAndroidTopInset() {
  return Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0;
}

export function Screen({
  children,
  scroll = false,
  contentContainerStyle,
  style,
}: {
  children: React.ReactNode;
  scroll?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
}) {
  const { tokens } = useTheme();
  const styles = useStyles();
  const topInset = getAndroidTopInset();

  if (scroll) {
    return (
      <View style={[styles.screen.base, { paddingTop: topInset }, style]}>
        <View
          pointerEvents="none"
          style={[styles.screen.backgroundGradient, { top: topInset }]}
        />
        <ScrollView
          contentContainerStyle={[
            {
              padding: tokens.spacing.lg,
              paddingBottom: tokens.spacing.xxl,
              gap: tokens.spacing.lg,
            },
            contentContainerStyle,
          ]}
          keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.screen.base, { paddingTop: topInset }, style]}>
      <View
        pointerEvents="none"
        style={[styles.screen.backgroundGradient, { top: topInset }]}
      />
      {children}
    </View>
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  const { tokens } = useTheme();
  const styles = useStyles();

  return (
    <View style={styles.rowSpaceBetween}>
      <View style={{ flex: 1 }}>
        <Text style={styles.displayText}>{title}</Text>
        {subtitle ? (
          <Text style={[styles.faintText, { marginTop: tokens.spacing.sm }]}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      {action ? <View>{action}</View> : null}
    </View>
  );
}

export function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const styles = useStyles();

  return <View style={[styles.card, style]}>{children}</View>;
}

export function CardTitle({
  title,
  action,
}: {
  title: string;
  action?: React.ReactNode;
}) {
  const { tokens } = useTheme();
  const styles = useStyles();

  return (
    <View style={[styles.rowSpaceBetween, { gap: tokens.spacing.md }]}>
      <Text style={[styles.titleText, { flex: 1 }]}>{title}</Text>
      {action}
    </View>
  );
}

export function Label({ children }: { children: React.ReactNode }) {
  const styles = useStyles();
  return <Text style={styles.labelText}>{children}</Text>;
}

export function MutedText({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: any;
}) {
  const styles = useStyles();
  return <Text style={[styles.mutedText, style]}>{children}</Text>;
}

export function FaintText({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: any;
}) {
  const styles = useStyles();
  return <Text style={[styles.faintText, style]}>{children}</Text>;
}

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
  const { colors, tokens } = useTheme();
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

export function EmptyState({ text }: { text: string }) {
  const styles = useStyles();
  return (
    <View style={[styles.card, { padding: 16 }]}>
      <Text style={styles.mutedText}>{text}</Text>
    </View>
  );
}

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

export function BottomSheet({
  visible,
  onClose,
  title,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  const { tokens } = useTheme();
  const styles = useStyles();

  if (!visible) return null;

  return (
    <View style={styles.modalOverlay}>
      <Pressable style={{ flex: 1 }} onPress={onClose} />
      <View
        style={[
          styles.bottomSheet,
          {
            borderTopLeftRadius: tokens.nativeRadius.lg,
            borderTopRightRadius: tokens.nativeRadius.lg,
          },
        ]}>
        {title ? <Text style={styles.titleText}>{title}</Text> : null}
        {children}
      </View>
    </View>
  );
}
