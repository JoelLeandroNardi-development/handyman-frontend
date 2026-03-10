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
import Slider from "@react-native-community/slider";
import {
  getSkillsCatalogFlat,
  getMeHandyman,
  updateMeHandyman,
  type HandymanResponse,
  type SkillCatalogFlatResponse,
} from "@smart/api";
import { createApiClient } from "../../lib/api";
import { useSession } from "../../auth/SessionProvider";

export default function ProfilePlaceholder() {
  const api = useMemo(() => createApiClient(), []);
  const { session, availableRoles, pickRole, roleMode, logout, refresh } = useSession();

  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [saving, setSaving] = useState(false);
  const [locating, setLocating] = useState(false);

  const [catalog, setCatalog] = useState<SkillCatalogFlatResponse | null>(null);
  const [profile, setProfile] = useState<HandymanResponse | null>(null);

  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [yearsExperience, setYearsExperience] = useState<string>("");
  const [serviceRadiusKm, setServiceRadiusKm] = useState<number>(0);
  const [latitude, setLatitude] = useState<string>("");
  const [longitude, setLongitude] = useState<string>("");

  useEffect(() => {
    void loadAll();
  }, []);

  async function loadAll() {
    await Promise.all([loadCatalog(), loadProfile()]);
  }

  async function loadCatalog() {
    setLoadingCatalog(true);
    try {
      const data = await getSkillsCatalogFlat(api, { active_only: true });
      setCatalog(data);
    } catch (e) {
      Alert.alert("Failed to load skills catalog", (e as Error).message);
    } finally {
      setLoadingCatalog(false);
    }
  }

  async function loadProfile() {
    setLoadingProfile(true);
    try {
      const data = await getMeHandyman(api);
      setProfile(data);
      setSelectedSkills(data.skills ?? []);
      setYearsExperience(String(data.years_experience ?? ""));
      setServiceRadiusKm(
        typeof data.service_radius_km === "number" ? data.service_radius_km : 0
      );
      setLatitude(data.latitude != null ? String(data.latitude) : "");
      setLongitude(data.longitude != null ? String(data.longitude) : "");
    } catch (e) {
      Alert.alert("Failed to load handyman profile", (e as Error).message);
    } finally {
      setLoadingProfile(false);
    }
  }

  function toggleSkill(skillKey: string) {
    setSelectedSkills((prev) =>
      prev.includes(skillKey) ? prev.filter((s) => s !== skillKey) : [...prev, skillKey]
    );
  }

  async function useCurrentLocation() {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Location permission", "Permission denied.");
        return;
      }

      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setLatitude(String(pos.coords.latitude));
      setLongitude(String(pos.coords.longitude));
    } catch (e) {
      Alert.alert("Location error", (e as Error).message);
    } finally {
      setLocating(false);
    }
  }

  async function saveProfile() {
    if (!profile) {
      Alert.alert("Missing profile", "Could not load your handyman profile.");
      return;
    }

    const parsedYears = Number.parseInt(yearsExperience, 10);

    if (Number.isNaN(parsedYears) || parsedYears < 0) {
      Alert.alert("Invalid years of experience", "Please enter a valid integer.");
      return;
    }

    let parsedLatitude: number | null = null;
    let parsedLongitude: number | null = null;

    if (latitude.trim() !== "") {
      parsedLatitude = Number.parseFloat(latitude);
      if (Number.isNaN(parsedLatitude)) {
        Alert.alert("Invalid latitude", "Latitude must be a valid number.");
        return;
      }
    }

    if (longitude.trim() !== "") {
      parsedLongitude = Number.parseFloat(longitude);
      if (Number.isNaN(parsedLongitude)) {
        Alert.alert("Invalid longitude", "Longitude must be a valid number.");
        return;
      }
    }

    if ((parsedLatitude === null) !== (parsedLongitude === null)) {
      Alert.alert("Invalid location", "Latitude and longitude must both be set or both be empty.");
      return;
    }

    setSaving(true);
    try {
      const updated = await updateMeHandyman(api, {
        skills: selectedSkills,
        years_experience: parsedYears,
        service_radius_km: Math.round(serviceRadiusKm),
        latitude: parsedLatitude,
        longitude: parsedLongitude,
      });

      setProfile(updated);
      setSelectedSkills(updated.skills ?? selectedSkills);
      setYearsExperience(String(updated.years_experience ?? ""));
      setServiceRadiusKm(
        typeof updated.service_radius_km === "number" ? updated.service_radius_km : 0
      );
      setLatitude(updated.latitude != null ? String(updated.latitude) : "");
      setLongitude(updated.longitude != null ? String(updated.longitude) : "");

      await refresh();
      Alert.alert("Profile updated", "Your profile was saved.");
    } catch (e) {
      Alert.alert("Save failed", (e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  const loading = loadingCatalog || loadingProfile;

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
          <Text style={{ opacity: 0.7 }}>Roles: {(session?.roles ?? []).join(", ") || "-"}</Text>
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
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text style={{ fontWeight: "700" }}>Handyman details</Text>

            <TouchableOpacity
              onPress={() => void loadAll()}
              style={{
                backgroundColor: "#111827",
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 10,
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "700" }}>Refresh</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={{ paddingVertical: 12 }}>
              <ActivityIndicator />
            </View>
          ) : (
            <>
              <View style={{ gap: 6 }}>
                <Text style={{ fontWeight: "600" }}>Years of experience</Text>
                <TextInput
                  value={yearsExperience}
                  onChangeText={setYearsExperience}
                  keyboardType="number-pad"
                  placeholder="e.g. 5"
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
                <Text style={{ fontWeight: "600" }}>
                  Service radius: {Math.round(serviceRadiusKm)} km
                </Text>
                <Slider
                  minimumValue={0}
                  maximumValue={100}
                  step={1}
                  value={serviceRadiusKm}
                  onValueChange={setServiceRadiusKm}
                />
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ opacity: 0.6, fontSize: 12 }}>0 km</Text>
                  <Text style={{ opacity: 0.6, fontSize: 12 }}>100 km</Text>
                </View>
              </View>

              <View style={{ gap: 6 }}>
                <Text style={{ fontWeight: "600" }}>Location</Text>

                <View style={{ flexDirection: "row", gap: 10 }}>
                  <TextInput
                    value={latitude}
                    onChangeText={setLatitude}
                    keyboardType="decimal-pad"
                    placeholder="Latitude"
                    style={{
                      flex: 1,
                      borderWidth: 1,
                      borderColor: "#ddd",
                      borderRadius: 10,
                      padding: 12,
                      backgroundColor: "#fff",
                    }}
                  />
                  <TextInput
                    value={longitude}
                    onChangeText={setLongitude}
                    keyboardType="decimal-pad"
                    placeholder="Longitude"
                    style={{
                      flex: 1,
                      borderWidth: 1,
                      borderColor: "#ddd",
                      borderRadius: 10,
                      padding: 12,
                      backgroundColor: "#fff",
                    }}
                  />
                </View>

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
                    <Text style={{ color: "#fff", fontWeight: "700" }}>Use current location</Text>
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}
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
          <Text style={{ fontWeight: "700" }}>Skills</Text>

          {loading ? (
            <View style={{ paddingVertical: 12 }}>
              <ActivityIndicator />
            </View>
          ) : !catalog || catalog.categories.length === 0 ? (
            <Text style={{ opacity: 0.7 }}>No active skills found in catalog.</Text>
          ) : (
            <>
              {catalog.categories.map((category) => {
                const skillsInCategory = category.skills.filter((s) => s.active);
                if (skillsInCategory.length === 0) return null;

                return (
                  <View key={category.key} style={{ marginTop: 4 }}>
                    <Text
                      style={{
                        fontSize: 15,
                        fontWeight: "800",
                        marginBottom: 8,
                      }}
                    >
                      {category.label}
                    </Text>

                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                      {skillsInCategory.map((skill) => {
                        const selected = selectedSkills.includes(skill.key);

                        return (
                          <TouchableOpacity
                            key={skill.key}
                            onPress={() => toggleSkill(skill.key)}
                            style={{
                              paddingHorizontal: 12,
                              paddingVertical: 10,
                              borderRadius: 999,
                              borderWidth: 1,
                              borderColor: selected ? "#2563eb" : "#d1d5db",
                              backgroundColor: selected ? "#eff6ff" : "#fff",
                            }}
                          >
                            <Text
                              style={{
                                fontWeight: "600",
                                color: selected ? "#1d4ed8" : "#111827",
                              }}
                            >
                              {skill.label}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                );
              })}

              <TouchableOpacity
                onPress={saveProfile}
                disabled={saving || loading || !profile}
                style={{
                  marginTop: 8,
                  backgroundColor: saving || loading || !profile ? "#93c5fd" : "#2563eb",
                  padding: 12,
                  borderRadius: 12,
                  alignItems: "center",
                }}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={{ color: "#fff", fontWeight: "700" }}>Save profile</Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>

        {availableRoles.length > 1 ? (
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
        ) : null}

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