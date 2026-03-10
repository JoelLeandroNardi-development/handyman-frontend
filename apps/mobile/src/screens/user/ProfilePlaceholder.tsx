import React, { useEffect, useMemo, useState } from "react";
import {
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  ActivityIndicator,
  Alert,
  TextInput,
} from "react-native";
import * as Location from "expo-location";
import { getMeUser, updateMe } from "@smart/api";
import { createApiClient } from "../../lib/api";
import { useSession } from "../../auth/SessionProvider";

export default function ProfilePlaceholder() {
  const api = useMemo(() => createApiClient(), []);
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

      if (data.latitude && data.longitude) {
        setLocationLabel(`${data.latitude.toFixed(4)}, ${data.longitude.toFixed(4)}`);
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

      setLocationLabel(
        `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`
      );

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

  const loading = loadingProfile;

  return (
    <SafeAreaView style={{ flex: 1, padding: 16, backgroundColor: "#f6f7fb" }}>
      <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: "700" }}>Profile</Text>

        <View
          style={{
            backgroundColor: "#fff",
            borderWidth: 1,
            borderColor: "#e6e8ef",
            borderRadius: 14,
            padding: 14,
            gap: 6,
          }}
        >
          <Text style={{ fontWeight: "700" }}>{session?.email ?? "-"}</Text>
          <Text style={{ opacity: 0.7 }}>Current mode: {roleMode ?? "-"}</Text>
          <Text style={{ opacity: 0.7 }}>
            Roles: {(session?.roles ?? []).join(", ") || "-"}
          </Text>
        </View>

        <View
          style={{
            backgroundColor: "#fff",
            borderWidth: 1,
            borderColor: "#e6e8ef",
            borderRadius: 14,
            padding: 14,
            gap: 10,
          }}
        >
          <Text style={{ fontWeight: "700" }}>User details</Text>

          {loading ? (
            <ActivityIndicator />
          ) : (
            <>
              <View style={{ gap: 6 }}>
                <Text style={{ fontWeight: "600" }}>Full name</Text>

                <TextInput
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Your full name"
                  style={{
                    borderWidth: 1,
                    borderColor: "#ddd",
                    borderRadius: 10,
                    padding: 12,
                    backgroundColor: "#fff",
                  }}
                />
              </View>

              <View style={{ gap: 6 }}>
                <Text style={{ fontWeight: "600" }}>Current location</Text>

                <Text style={{ opacity: 0.7 }}>{locationLabel}</Text>

                <TouchableOpacity
                  onPress={useCurrentLocation}
                  disabled={locating}
                  style={{
                    backgroundColor: locating ? "#9ca3af" : "#2563eb",
                    padding: 12,
                    borderRadius: 12,
                    alignItems: "center",
                  }}
                >
                  {locating ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={{ color: "#fff", fontWeight: "700" }}>
                      Use current location
                    </Text>
                  )}
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={saveProfile}
                disabled={saving}
                style={{
                  backgroundColor: saving ? "#93c5fd" : "#2563eb",
                  padding: 12,
                  borderRadius: 12,
                  alignItems: "center",
                }}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={{ color: "#fff", fontWeight: "700" }}>
                    Save profile
                  </Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>

        {availableRoles.length > 1 && (
          <View
            style={{
              backgroundColor: "#fff",
              borderWidth: 1,
              borderColor: "#e6e8ef",
              borderRadius: 14,
              padding: 14,
              gap: 10,
            }}
          >
            <Text style={{ fontWeight: "700" }}>Switch role</Text>

            <View style={{ flexDirection: "row", gap: 10 }}>
              <TouchableOpacity
                onPress={() => pickRole("user")}
                style={{
                  flex: 1,
                  backgroundColor: "#e5e7eb",
                  padding: 12,
                  borderRadius: 12,
                  alignItems: "center",
                }}
              >
                <Text>User</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => pickRole("handyman")}
                style={{
                  flex: 1,
                  backgroundColor: "#e5e7eb",
                  padding: 12,
                  borderRadius: 12,
                  alignItems: "center",
                }}
              >
                <Text>Handyman</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <TouchableOpacity
          onPress={logout}
          style={{
            backgroundColor: "#111827",
            padding: 12,
            borderRadius: 12,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "700" }}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}