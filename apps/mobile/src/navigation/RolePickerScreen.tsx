import React from "react";
import { Text } from "react-native";
import { useSession } from "../auth/SessionProvider";
import { useTheme } from "../theme";
import { AppButton, Card, PageHeader, Screen } from "../ui/primitives";
import ThemeToggleCard from "../ui/ThemeToggleCard";

const ROLE_OPTIONS = [
  {
    key: "user" as const,
    title: "Continue as User",
    description: "Find handymen and request bookings.",
    buttonLabel: "Open user app",
  },
  {
    key: "handyman" as const,
    title: "Continue as Handyman",
    description: "Manage jobs, availability, and profile.",
    buttonLabel: "Open handyman app",
  },
];

export default function RolePickerScreen() {
  const { pickRole } = useSession();
  const { colors } = useTheme();

  return (
    <Screen scroll contentContainerStyle={{ gap: 16 }}>
      <PageHeader
        title="Choose mode"
        subtitle="Your account supports both roles. Pick how you want to use the app right now."
      />

      <ThemeToggleCard />

      {ROLE_OPTIONS.map((role) => (
        <Card key={role.key}>
          <Text style={{ fontSize: 18, fontWeight: "800", color: colors.text }}>
            {role.title}
          </Text>

          <Text style={{ color: colors.textSoft, fontSize: 15 }}>
            {role.description}
          </Text>

          <AppButton
            label={role.buttonLabel}
            onPress={() => pickRole(role.key)}
          />
        </Card>
      ))}
    </Screen>
  );
}