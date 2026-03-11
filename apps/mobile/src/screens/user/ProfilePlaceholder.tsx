import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Text,
  View,
} from "react-native";
import * as Location from "expo-location";
import { getMeUser, updateMe } from "@smart/api";
import { createApiClient } from "../../lib/api";
import { useTheme } from "../../theme";
import { useSession } from "../../auth/SessionProvider";
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

export default function ProfilePlaceholder() {
  const api = useMemo(() => createApiClient(), []);
  const { colors } = useTheme();
  const { session, availableRoles, pickRole, roleMode, logout, refresh } = useSession();

  const [loadingProfile, setLoadingProfile] = useState(false);
  const [saving, setSaving] = useState(false);
  const [locating, setLocating] = useState(false);

  const [fullName, setFullName] = useState("");
  const [locationLabel, setLocationLabel] = useState("Location not set");

  useEffect(() => {
    void loadProfile();
  }, []);

  async function loadProfile() {
    setLoadingProfile(true);

    try {
      const data = await getMeUser(api);
      setFullName(data.full_name ?? "");

      if (data.latitude != null && data.longitude != null) {
        setLocationLabel(`${data.latitude.toFixed(4)}, ${data.longitude.toFixed(4)}`);
      } else {
        setLocationLabel("Location not set");
      }
    } catch (e) {
      Alert.alert("Failed to load profile", (e as Error).message);
    } finally {
      setLoadingProfile(false);
    }
  }

  async function useCurrentLocation() {
    setLocating(true);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission denied", "Location permission is required.");
        return;
      }

      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      await updateMe(api, {
        full_name: fullName.trim() === "" ? null : fullName.trim(),
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });

      setLocationLabel(`${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
      await refresh();
      Alert.alert("Location updated");
    } catch (e) {
      Alert.alert("Location error", (e as Error).message);
    } finally {
      setLocating(false);
    }
  }

  async function saveProfile() {
    setSaving(true);

    try {
      await updateMe(api, {
        full_name: fullName.trim() === "" ? null : fullName.trim(),
      });

      await refresh();
      Alert.alert("Profile updated");
    } catch (e) {
      Alert.alert("Save failed", (e as Error).message);
    } finally {
      setSaving(false);
    }
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
                onPress={useCurrentLocation}
                loading={locating}
              />
            </View>

            <AppButton label="Save profile" onPress={saveProfile} loading={saving} />
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