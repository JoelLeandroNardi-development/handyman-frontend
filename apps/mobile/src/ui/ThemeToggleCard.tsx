import React from "react";
import { Pressable, Text, View } from "react-native";
import { Card, CardTitle } from "./primitives";
import { useTheme } from "../theme";

function ThemeSwitch({
  value,
  onToggle,
}: {
  value: boolean;
  onToggle: () => void;
}) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onToggle}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      accessibilityLabel={value ? "Dark theme enabled" : "Light theme enabled"}
      style={{
        width: 72,
        height: 40,
        borderRadius: 999,
        borderWidth: 2,
        borderColor: value ? colors.borderStrong : colors.text,
        backgroundColor: value ? colors.surfaceMuted : colors.surface,
        padding: 2,
        justifyContent: "center",
      }}
    >
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 999,
          backgroundColor: value ? colors.surface : colors.text,
          alignSelf: value ? "flex-end" : "flex-start",
        }}
      />
    </Pressable>
  );
}

export default function ThemeToggleCard() {
  const { mode, toggle, colors } = useTheme();
  const isDark = mode === "dark";

  return (
    <Card>
      <CardTitle title="Theme" />
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: "800", color: colors.text }}>
            Current theme: {isDark ? "Dark" : "Light"}
          </Text>
          <Text style={{ marginTop: 4, color: colors.textSoft, fontSize: 14 }}>
            Choose how the app looks.
          </Text>
        </View>

        <ThemeSwitch value={isDark} onToggle={toggle} />
      </View>
    </Card>
  );
}