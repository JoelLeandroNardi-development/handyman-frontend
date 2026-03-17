import React, { useEffect, useMemo } from "react";
import {
  ActivityIndicator,
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
import { parseOptionalCoordinates, toNullableString } from "../../lib/profileForm";
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
  SkillChip,
} from "../../ui/primitives";
import ThemeToggleCard from "../../ui/ThemeToggleCard";

export default function ProfilePlaceholder() {
  const api = useMemo(() => createApiClient(), []);
  const { colors } = useTheme();
  const { session, availableRoles, pickRole, roleMode, logout, refresh } = useSession();

  const [catalog, setCatalog] = React.useState<SkillCatalogFlatResponse | null>(null);
  const [profile, setProfile] = React.useState<HandymanResponse | null>(null);

  const [selectedSkills, setSelectedSkills] = React.useState<string[]>([]);
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [nationalId, setNationalId] = React.useState("");
  const [addressLine, setAddressLine] = React.useState("");
  const [postalCode, setPostalCode] = React.useState("");
  const [city, setCity] = React.useState("");
  const [country, setCountry] = React.useState("");
  const [yearsExperience, setYearsExperience] = React.useState("");
  const [serviceRadiusKm, setServiceRadiusKm] = React.useState(0);
  const [latitude, setLatitude] = React.useState("");
  const [longitude, setLongitude] = React.useState("");

  const applyProfileData = React.useCallback((data: HandymanResponse) => {
    setProfile(data);
    setSelectedSkills(data.skills ?? []);
    setFirstName(data.first_name ?? "");
    setLastName(data.last_name ?? "");
    setPhone(data.phone ?? "");
    setNationalId(data.national_id ?? "");
    setAddressLine(data.address_line ?? "");
    setPostalCode(data.postal_code ?? "");
    setCity(data.city ?? "");
    setCountry(data.country ?? "");
    setYearsExperience(String(data.years_experience ?? ""));
    setServiceRadiusKm(typeof data.service_radius_km === "number" ? data.service_radius_km : 0);
    setLatitude(data.latitude != null ? String(data.latitude) : "");
    setLongitude(data.longitude != null ? String(data.longitude) : "");
  }, []);

  const { execute: loadCatalog, loading: loadingCatalog } = useAsyncOperation({
    alertTitle: "Load Skills Catalog",
  });

  const { execute: loadProfile, loading: loadingProfile } = useAsyncOperation({
    alertTitle: "Load Profile",
  });

  const { execute: handleLocationUpdate, loading: locating } = useAsyncOperation({
    alertTitle: "Get Current Location",
  });

  const { execute: handleProfileSave, loading: saving } = useAsyncOperation({
    alertTitle: "Save Profile",
    onSuccess: () => {
      refresh();
      void loadAll();
    },
  });

  async function loadAll() {
    await Promise.all([
      loadCatalog(async () => {
        const data = await getSkillsCatalogFlat(api, { active_only: true });
        setCatalog(data);
      }),
      loadProfile(async () => {
        const data = await getMeHandyman(api);
        applyProfileData(data);
      }),
    ]);
  }

  useEffect(() => {
    void loadAll();
  }, []);

  function toggleSkill(skillKey: string) {
    setSelectedSkills((prev) =>
      prev.includes(skillKey) ? prev.filter((s) => s !== skillKey) : [...prev, skillKey]
    );
  }

  async function useCurrentLocation() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      throw new Error("Location permission denied.");
    }

    const pos = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    setLatitude(String(pos.coords.latitude));
    setLongitude(String(pos.coords.longitude));
  }

  async function saveProfile() {
    if (!profile) {
      throw new Error("Could not load your handyman profile.");
    }

    const parsedYears = Number.parseInt(yearsExperience, 10);
    if (Number.isNaN(parsedYears) || parsedYears < 0) {
      throw new Error("Please enter a valid integer for years of experience.");
    }

    const { latitude: parsedLatitude, longitude: parsedLongitude } =
      parseOptionalCoordinates(latitude, longitude);

    const updated = await updateMeHandyman(api, {
      first_name: toNullableString(firstName),
      last_name: toNullableString(lastName),
      phone: toNullableString(phone),
      national_id: toNullableString(nationalId),
      address_line: toNullableString(addressLine),
      postal_code: toNullableString(postalCode),
      city: toNullableString(city),
      country: toNullableString(country),
      skills: selectedSkills,
      years_experience: parsedYears,
      service_radius_km: Math.round(serviceRadiusKm),
      latitude: parsedLatitude,
      longitude: parsedLongitude,
    });
    applyProfileData(updated);
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
              <Label>First name</Label>
              <AppInput value={firstName} onChangeText={setFirstName} placeholder="First name" />
            </View>

            <View style={{ gap: 8 }}>
              <Label>Last name</Label>
              <AppInput value={lastName} onChangeText={setLastName} placeholder="Last name" />
            </View>

            <View style={{ gap: 8 }}>
              <Label>Phone</Label>
              <AppInput value={phone} onChangeText={setPhone} placeholder="Phone" keyboardType="phone-pad" />
            </View>

            <View style={{ gap: 8 }}>
              <Label>National ID</Label>
              <AppInput value={nationalId} onChangeText={setNationalId} placeholder="National ID" />
            </View>

            <View style={{ gap: 8 }}>
              <Label>Address line</Label>
              <AppInput value={addressLine} onChangeText={setAddressLine} placeholder="Address line" />
            </View>

            <ButtonRow>
              <View style={{ flex: 1, gap: 8 }}>
                <Label>Postal code</Label>
                <AppInput value={postalCode} onChangeText={setPostalCode} placeholder="Postal code" />
              </View>
              <View style={{ flex: 1, gap: 8 }}>
                <Label>City</Label>
                <AppInput value={city} onChangeText={setCity} placeholder="City" />
              </View>
            </ButtonRow>

            <View style={{ gap: 8 }}>
              <Label>Country</Label>
              <AppInput value={country} onChangeText={setCountry} placeholder="Country" />
            </View>

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
                onPress={() => handleLocationUpdate(useCurrentLocation)}
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
              onPress={() => handleProfileSave(saveProfile)}
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