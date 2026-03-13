import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Text,
  View,
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
  SkillChip,
} from "../../ui/primitives";
import ThemeToggleCard from "../../ui/ThemeToggleCard";

export default function ProfilePlaceholder() {
  const api = useMemo(() => createApiClient(), []);
  const { colors } = useTheme();
  const { session, availableRoles, pickRole, roleMode, logout, refresh } = useSession();

  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [saving, setSaving] = useState(false);
  const [locating, setLocating] = useState(false);

  const [catalog, setCatalog] = useState<SkillCatalogFlatResponse | null>(null);
  const [profile, setProfile] = useState<HandymanResponse | null>(null);

  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [yearsExperience, setYearsExperience] = useState("");
  const [serviceRadiusKm, setServiceRadiusKm] = useState(0);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

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
      setServiceRadiusKm(typeof data.service_radius_km === "number" ? data.service_radius_km : 0);
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
      setSelectedSkills(updated.skills ?? []);
      setYearsExperience(String(updated.years_experience ?? ""));
      setServiceRadiusKm(typeof updated.service_radius_km === "number" ? updated.service_radius_km : 0);
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
        <CardTitle
          title="Handyman details"
          action={<AppButton label="Refresh" onPress={() => void loadAll()} style={{ minWidth: 110 }} />}
        />

        {loading ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <>
            <View style={{ gap: 8 }}>
              <Label>Years of experience</Label>
              <AppInput
                value={yearsExperience}
                onChangeText={setYearsExperience}
                keyboardType="number-pad"
                placeholder="e.g. 5"
              />
            </View>

            <View style={{ gap: 8 }}>
              <Label>Service radius: {Math.round(serviceRadiusKm)} km</Label>
              <Slider
                minimumValue={0}
                maximumValue={100}
                step={1}
                value={serviceRadiusKm}
                onValueChange={setServiceRadiusKm}
                minimumTrackTintColor={colors.primary}
                maximumTrackTintColor={colors.border}
              />
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ color: colors.textFaint }}>0 km</Text>
                <Text style={{ color: colors.textFaint }}>100 km</Text>
              </View>
            </View>

            <View style={{ gap: 8 }}>
              <Label>Location</Label>
              <ButtonRow>
                <AppInput
                  value={latitude}
                  onChangeText={setLatitude}
                  keyboardType="decimal-pad"
                  placeholder="Latitude"
                  style={{ flex: 1 }}
                />
                <AppInput
                  value={longitude}
                  onChangeText={setLongitude}
                  keyboardType="decimal-pad"
                  placeholder="Longitude"
                  style={{ flex: 1 }}
                />
              </ButtonRow>
              <AppButton
                label="Use current location"
                onPress={useCurrentLocation}
                loading={locating}
              />
            </View>
          </>
        )}
      </Card>

      <Card>
        <CardTitle title="Skills" />

        {loading ? (
          <ActivityIndicator color={colors.primary} />
        ) : !catalog || catalog.categories.length === 0 ? (
          <Text style={{ color: colors.textSoft }}>No active skills found in catalog.</Text>
        ) : (
          <>
            {catalog.categories.map((category) => {
              const skillsInCategory = category.skills.filter((s) => s.active);
              if (skillsInCategory.length === 0) return null;

              return (
                <View key={category.key} style={{ gap: 10 }}>
                  <Text style={{ fontSize: 16, fontWeight: "800", color: colors.text }}>
                    {category.label}
                  </Text>

                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                    {skillsInCategory.map((skill) => (
                      <SkillChip
                        key={skill.key}
                        label={skill.label}
                        selected={selectedSkills.includes(skill.key)}
                        onPress={() => toggleSkill(skill.key)}
                      />
                    ))}
                  </View>
                </View>
              );
            })}

            <AppButton
              label="Save profile"
              onPress={saveProfile}
              loading={saving}
              disabled={loading || !profile}
            />
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