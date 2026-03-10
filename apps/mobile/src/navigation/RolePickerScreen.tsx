import React from "react";
import { SafeAreaView, Text, TouchableOpacity, View } from "react-native";
import { useSession } from "../auth/SessionProvider";
import { useTheme } from "../theme";

export default function RolePickerScreen() {
  const { pickRole } = useSession();
  const { colors, toggle, mode } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, padding: 16, gap: 12, backgroundColor: colors.bg }}>
      <Text style={{ fontSize: 22, fontWeight: "700", color: colors.text }}>Choose mode</Text>
      <Text style={{ opacity: 0.7, color: colors.textSoft }}>
        Your account supports both roles. Pick how you want to use the app right now.
      </Text>

      <TouchableOpacity
        onPress={toggle}
        style={{
          borderRadius: 12,
          padding: 10,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.surface,
          alignSelf: "flex-start",
        }}
      >
        <Text style={{ color: colors.text }}>{mode === "light" ? "Switch to dark" : "Switch to light"}</Text>
      </TouchableOpacity>

      <View style={{ gap: 12, marginTop: 12 }}>
        <TouchableOpacity
          onPress={() => pickRole("user")}
          style={{
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 14,
            padding: 14
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "700", color: colors.text }}>Continue as User</Text>
          <Text style={{ opacity: 0.7, marginTop: 6 }}>Find handymen, request bookings</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => pickRole("handyman")}
          style={{
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 14,
            padding: 14
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "700", color: colors.text }}>Continue as Handyman</Text>
          <Text style={{ opacity: 0.7, marginTop: 6 }}>Manage jobs, confirm requests</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}