import React, { useEffect, useMemo } from "react";
import {
  ActivityIndicator,
  Text,
  View,
} from "react-native";
import * as Location from "expo-location";
import { getMeUser, updateMe } from "@smart/api";
import { createApiClient } from "../../lib/api";
import { useTheme } from "../../theme";
import { useSession } from "../../auth/SessionProvider";
import { useAsyncOperation } from "../../hooks/useAsyncOperation";
import {
  AppButton,
  AppInput,
  ButtonRow,
  Card,
  CardTitle,
  Label,
  PageHeader,
  Screen,
} from "../../ui/primitives";
import ThemeToggleCard from "../../ui/ThemeToggleCard";

export default function ProfilePlaceholder() {
  const api = useMemo(() => createApiClient(), []);
  const { colors } = useTheme();
  const { session, availableRoles, pickRole, roleMode, logout, refresh } = useSession();

  const [fullName, setFullName] = React.useState("");
  const [locationLabel, setLocationLabel] = React.useState("Location not set");

  const { execute: loadProfile, loading: loadingProfile } = useAsyncOperation({
    alertTitle: "Load Profile",
  });

  const { execute: handleLocationUpdate, loading: locating } = useAsyncOperation({
    alertTitle: "Location Update",
    onSuccess: () => {
      refresh();
    },
  });

  const { execute: handleProfileSave, loading: saving } = useAsyncOperation({
    alertTitle: "Save Profile",
    onSuccess: () => {
      refresh();
    },
  });

  useEffect(() => {
    loadProfile(async () => {
      const data = await getMeUser(api);
      const first = data.first_name ?? "";
      const last = data.last_name ?? "";
      setFullName(`${first} ${last}`.trim());

      if (data.latitude != null && data.longitude != null) {
        setLocationLabel(`${data.latitude.toFixed(4)}, ${data.longitude.toFixed(4)}`);
      } else {
        setLocationLabel("Location not set");
      }
    });
  }, []);

  async function useCurrentLocation() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      throw new Error("Location permission is required.");
    }

    const pos = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    const [first, last] = fullName.split(" ");
    await updateMe(api, {
      first_name: first?.trim() || null,
      last_name: last?.trim() || null,
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude,
    });

    setLocationLabel(`${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
  }

  async function saveProfile() {
    const [first, last] = fullName.split(" ");
    await updateMe(api, {
      first_name: first?.trim() || null,
      last_name: last?.trim() || null,
    });
  }

  return (
    <Screen scroll>
      <PageHeader title="Profile" />

      <Card>
        <Text style={{ fontSize: 16, fontWeight: "800", color: colors.text }}>{session?.email ?? "-"}</Text>
        <Text style={{ color: colors.textSoft, fontSize: 15 }}>Current mode: {roleMode ?? "-"}</Text>
        <Text style={{ color: colors.textSoft, fontSize: 15 }}>
          Roles: {(session?.roles ?? []).join(", ") || "-"}
        </Text>
      </Card>

      <ThemeToggleCard />

      <Card>
        <CardTitle title="User details" />

        {loadingProfile ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <>
            <View style={{ gap: 8 }}>
              <Label>Full name</Label>
              <AppInput
                value={fullName}
                onChangeText={setFullName}
                placeholder="Your full name"
              />
            </View>

            <View style={{ gap: 8 }}>
              <Label>Current location</Label>
              <Text style={{ color: colors.textSoft, fontSize: 15 }}>{locationLabel}</Text>

              <AppButton
                label="Use current location"
                onPress={() => handleLocationUpdate(useCurrentLocation)}
                loading={locating}
              />
            </View>

            <AppButton label="Save profile" onPress={() => handleProfileSave(saveProfile)} loading={saving} />
          </>
        )}
      </Card>

      {availableRoles.length > 1 ? (
        <Card>
          <CardTitle title="Switch role" />
          <ButtonRow>
            <AppButton label="User" onPress={() => pickRole("user")} tone="secondary" style={{ flex: 1 }} />
            <AppButton label="Handyman" onPress={() => pickRole("handyman")} tone="secondary" style={{ flex: 1 }} />
          </ButtonRow>
        </Card>
      ) : null}

      <AppButton label="Logout" onPress={logout} />
    </Screen>
  );
}