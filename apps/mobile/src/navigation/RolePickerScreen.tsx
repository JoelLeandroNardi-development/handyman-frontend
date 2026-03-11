import React from "react";
import { Text, View } from "react-native";
import { useSession } from "../auth/SessionProvider";
import { useTheme } from "../theme";
import { AppButton, Card, PageHeader, Screen } from "../ui/primitives";

export default function RolePickerScreen() {
  const { pickRole } = useSession();
  const { toggle, mode, colors } = useTheme();

  return (
    <Screen scroll contentContainerStyle={{ gap: 16 }}>
      <PageHeader
        title="Choose mode"
        subtitle="Your account supports both roles. Pick how you want to use the app right now."
      />

      <AppButton
        label={mode === "light" ? "Switch to dark" : "Switch to light"}
        onPress={toggle}
        tone="secondary"
        style={{ alignSelf: "flex-start", minWidth: 170 }}
      />

      <Card>
        <Text style={{ fontSize: 18, fontWeight: "800", color: colors.text }}>Continue as User</Text>
        <Text style={{ color: colors.textSoft, fontSize: 15 }}>
          Find handymen and request bookings.
        </Text>
        <AppButton label="Open user app" onPress={() => pickRole("user")} />
      </Card>

      <Card>
        <Text style={{ fontSize: 18, fontWeight: "800", color: colors.text }}>Continue as Handyman</Text>
        <Text style={{ color: colors.textSoft, fontSize: 15 }}>
          Manage jobs, availability, and profile.
        </Text>
        <AppButton label="Open handyman app" onPress={() => pickRole("handyman")} />
      </Card>
    </Screen>
  );
}