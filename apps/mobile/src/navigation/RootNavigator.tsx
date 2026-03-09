import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import LoginScreen from "../auth/LoginScreen";
import RolePickerScreen from "./RolePickerScreen";
import UserTabs from "./UserTabs";
import HandymanTabs from "./HandymanTabs";
import { SafeAreaView, Text } from "react-native";
import { useSession } from "../auth/SessionProvider";

export default function RootNavigator() {
  const { loading, session, roleMode, availableRoles } = useSession();

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading…</Text>
      </SafeAreaView>
    );
  }

  if (!session) {
    return (
      <NavigationContainer>
        <LoginScreen />
      </NavigationContainer>
    );
  }

  if (availableRoles.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 16 }}>
        <Text style={{ fontSize: 16, fontWeight: "700" }}>No mobile role</Text>
        <Text style={{ opacity: 0.7, marginTop: 8, textAlign: "center" }}>
          Your account does not include user or handyman roles.
        </Text>
      </SafeAreaView>
    );
  }

  if (availableRoles.length > 1 && !roleMode) {
    return (
      <NavigationContainer>
        <RolePickerScreen />
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer>
      {roleMode === "handyman" ? <HandymanTabs /> : <UserTabs />}
    </NavigationContainer>
  );
}