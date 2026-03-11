import React from "react";
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
} from "react-native";
import { useTheme } from "../theme";

function getAndroidTopInset() {
  return Platform.OS === "android" ? (StatusBar.currentHeight ?? 0) : 0;
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
  const { colors } = useTheme();
  const topInset = getAndroidTopInset();

  if (scroll) {
    return (
      <View style={[{ flex: 1, backgroundColor: colors.bg, paddingTop: topInset }, style]}>
        <ScrollView
          contentContainerStyle={[
            {
              padding: 16,
              paddingBottom: 28,
              gap: 12,
            },
            contentContainerStyle,
          ]}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[{ flex: 1, backgroundColor: colors.bg, paddingTop: topInset }, style]}>
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
  const { colors } = useTheme();

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: 12,
      }}
    >
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 24,
            lineHeight: 30,
            fontWeight: "800",
            color: colors.text,
          }}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text
            style={{
              marginTop: 6,
              fontSize: 15,
              lineHeight: 22,
              color: colors.textFaint,
            }}
          >
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
  const { colors } = useTheme();

  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 20,
          padding: 16,
          gap: 12,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function CardTitle({
  title,
  action,
}: {
  title: string;
  action?: React.ReactNode;
}) {
  const { colors } = useTheme();

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12,
      }}
    >
      <Text
        style={{
          fontSize: 16,
          fontWeight: "800",
          color: colors.text,
          flex: 1,
        }}
      >
        {title}
      </Text>
      {action}
    </View>
  );
}

export function Label({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();

  return (
    <Text
      style={{
        fontSize: 14,
        fontWeight: "700",
        color: colors.text,
      }}
    >
      {children}
    </Text>
  );
}

export function MutedText({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: any;
}) {
  const { colors } = useTheme();

  return <Text style={[{ color: colors.textSoft, fontSize: 14 }, style]}>{children}</Text>;
}

export function FaintText({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: any;
}) {
  const { colors } = useTheme();

  return <Text style={[{ color: colors.textFaint, fontSize: 14 }, style]}>{children}</Text>;
}

export function AppInput(props: TextInputProps) {
  const { colors } = useTheme();

  return (
    <TextInput
      placeholderTextColor={colors.textFaint}
      selectionColor={colors.primary}
      {...props}
      style={[
        {
          minHeight: 52,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 16,
          paddingHorizontal: 14,
          paddingVertical: 12,
          backgroundColor: colors.surface,
          color: colors.text,
          fontSize: 15,
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
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={{
        minHeight: 52,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 16,
        paddingHorizontal: 14,
        paddingVertical: 12,
        backgroundColor: colors.surface,
        justifyContent: "center",
      }}
    >
      <Text style={{ color: colors.text, fontSize: 15 }}>{label}</Text>
    </Pressable>
  );
}

type ButtonTone = "primary" | "secondary" | "danger" | "surface";

function getButtonColors(tone: ButtonTone, colors: ReturnType<typeof useTheme>["colors"]) {
  switch (tone) {
    case "primary":
      return {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
        textColor: "#ffffff",
      };
    case "danger":
      return {
        backgroundColor: colors.danger,
        borderColor: colors.danger,
        textColor: "#ffffff",
      };
    case "secondary":
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
  tone = "primary",
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
  const { colors } = useTheme();
  const palette = getButtonColors(tone, colors);

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        {
          minHeight: 54,
          borderRadius: 18,
          borderWidth: 1,
          borderColor: palette.borderColor,
          backgroundColor: disabled ? colors.border : palette.backgroundColor,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 16,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={palette.textColor} />
      ) : (
        <Text
          style={{
            color: disabled ? colors.textSoft : palette.textColor,
            fontSize: 15,
            fontWeight: "800",
          }}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

export function ButtonRow({ children }: { children: React.ReactNode }) {
  return <View style={{ flexDirection: "row", gap: 10 }}>{children}</View>;
}

export function EmptyState({ text }: { text: string }) {
  const { colors } = useTheme();

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 18,
        padding: 16,
      }}
    >
      <Text style={{ color: colors.textSoft, fontSize: 15 }}>{text}</Text>
    </View>
  );
}

type BadgeTone = "success" | "warning" | "danger" | "neutral" | "info";

export function StatusBadge({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: BadgeTone;
}) {
  const { colors } = useTheme();

  const palette = (() => {
    switch (tone) {
      case "success":
        return {
          backgroundColor: colors.successSoft,
          borderColor: colors.success,
          textColor: colors.success,
        };
      case "warning":
        return {
          backgroundColor: colors.warningSoft,
          borderColor: colors.warning,
          textColor: colors.warning,
        };
      case "danger":
        return {
          backgroundColor: colors.dangerSoft,
          borderColor: colors.danger,
          textColor: colors.danger,
        };
      case "info":
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
      style={{
        minHeight: 34,
        paddingHorizontal: 14,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: palette.borderColor,
        backgroundColor: palette.backgroundColor,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text style={{ color: palette.textColor, fontSize: 12, fontWeight: "800" }}>{label}</Text>
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
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingHorizontal: 14,
        paddingVertical: 11,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: selected ? colors.primary : colors.border,
        backgroundColor: selected ? colors.primarySoft : colors.surface,
      }}
    >
      <Text
        style={{
          color: selected ? colors.primary : colors.text,
          fontWeight: "700",
          fontSize: 14,
        }}
      >
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
  const { colors } = useTheme();

  if (!visible) return null;

  return (
    <View
      style={{
        position: "absolute",
        inset: 0,
        justifyContent: "flex-end",
        backgroundColor: "rgba(0,0,0,0.36)",
      }}
    >
      <Pressable style={{ flex: 1 }} onPress={onClose} />
      <View
        style={{
          backgroundColor: colors.surface,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          borderWidth: 1,
          borderColor: colors.border,
          padding: 16,
          gap: 12,
          maxHeight: "78%",
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "800", color: colors.text }}>{title}</Text>
        {children}
      </View>
    </View>
  );
}