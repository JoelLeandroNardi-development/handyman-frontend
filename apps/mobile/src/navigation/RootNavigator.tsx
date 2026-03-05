import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import LoginScreen from "../auth/LoginScreen";
import RolePickerScreen from "./RolePickerScreen";
import UserTabs from "./UserTabs";
import HandymanTabs from "./HandymanTabs";
import { getMobileRoles, getSession, getStoredRoleMode, storeRoleMode, type RoleMode } from "../auth/session";
import { SafeAreaView, Text } from "react-native";

type ViewState =
  | { kind: "loading" }
  | { kind: "loggedOut" }
  | { kind: "pickRole" }
  | { kind: "user" }
  | { kind: "handyman" }
  | { kind: "unauthorized" };

export default function RootNavigator() {
  const [state, setState] = useState<ViewState>({ kind: "loading" });

  async function hydrate() {
    const session = await getSession();
    if (!session) {
      setState({ kind: "loggedOut" });
      return;
    }

    const mobileRoles = getMobileRoles(session.roles);

    if (mobileRoles.length === 0) {
      setState({ kind: "unauthorized" });
      return;
    }

    if (mobileRoles.length === 1) {
      setState({ kind: mobileRoles[0] });
      return;
    }

    // has both roles -> show picker unless stored mode exists
    const stored = await getStoredRoleMode();
    if (stored) {
      setState({ kind: stored });
      return;
    }

    setState({ kind: "pickRole" });
  }

  useEffect(() => {
    hydrate();
  }, []);

  if (state.kind === "loading") {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading…</Text>
      </SafeAreaView>
    );
  }

  if (state.kind === "loggedOut") {
    return (
      <NavigationContainer>
        <LoginScreen onLoggedIn={hydrate} />
      </NavigationContainer>
    );
  }

  if (state.kind === "unauthorized") {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 16 }}>
        <Text style={{ fontSize: 16, fontWeight: "700" }}>No mobile role</Text>
        <Text style={{ opacity: 0.7, marginTop: 8, textAlign: "center" }}>
          Your account does not include user or handyman roles.
        </Text>
      </SafeAreaView>
    );
  }

  if (state.kind === "pickRole") {
    return (
      <NavigationContainer>
        <RolePickerScreen
          onPick={async (mode: RoleMode) => {
            await storeRoleMode(mode);
            setState({ kind: mode });
          }}
        />
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer>
      {state.kind === "user" ? <UserTabs /> : <HandymanTabs />}
    </NavigationContainer>
  );
}