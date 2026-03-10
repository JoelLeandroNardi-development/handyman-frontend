import React from "react";
import { NavigationContainer, DefaultTheme, DarkTheme } from "@react-navigation/native";
import LoginScreen from "../auth/LoginScreen";
import RolePickerScreen from "./RolePickerScreen";
import UserTabs from "./UserTabs";
import HandymanTabs from "./HandymanTabs";
import { SafeAreaView, Text } from "react-native";
import { useSession } from "../auth/SessionProvider";
import { useTheme } from "../theme";

export default function RootNavigator() {
  const { loading, session, roleMode, availableRoles } = useSession();
  const { mode, colors } = useTheme();

  const navTheme = mode === "dark"
    ? {
      ...DarkTheme,
      colors: {
        ...DarkTheme.colors,
        background: colors.bg,
        card: colors.surface,
        text: colors.text,
        border: colors.border,
        primary: colors.primary,
      },
    }
    : {
      ...DefaultTheme,
      colors: {
        ...DefaultTheme.colors,
        background: colors.bg,
        card: colors.surface,
        text: colors.text,
        border: colors.border,
        primary: colors.primary,
      },
    };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.bg }}>
        <Text style={{ color: colors.text }}>Loading…</Text>
      </SafeAreaView>
    );
  }

  if (!session) {
    return (
      <NavigationContainer theme={navTheme}>
        <LoginScreen />
      </NavigationContainer>
    );
  }

  if (availableRoles.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 16, backgroundColor: colors.bg }}>
        <Text style={{ fontSize: 16, fontWeight: "700", color: colors.text }}>No mobile role</Text>
        <Text style={{ opacity: 0.7, marginTop: 8, textAlign: "center", color: colors.textSoft }}>
          Your account does not include user or handyman roles.
        </Text>
      </SafeAreaView>
    );
  }

  if (availableRoles.length > 1 && !roleMode) {
    return (
      <NavigationContainer theme={navTheme}>
        <RolePickerScreen />
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer theme={navTheme}>
      {roleMode === "handyman" ? <HandymanTabs /> : <UserTabs />}
    </NavigationContainer>
  );
}