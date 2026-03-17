import React, { useEffect, useMemo } from "react";
import {
  ActivityIndicator,
  Text,
  View,
} from "react-native";
import * as Location from "expo-location";
import { getMeUser, updateMe, type UserResponse } from "@smart/api";
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
} from "../../ui/primitives";
import ThemeToggleCard from "../../ui/ThemeToggleCard";

export default function ProfilePlaceholder() {
  const api = useMemo(() => createApiClient(), []);
  const { colors } = useTheme();
  const { session, availableRoles, pickRole, roleMode, logout, refresh } = useSession();

  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [nationalId, setNationalId] = React.useState("");
  const [addressLine, setAddressLine] = React.useState("");
  const [postalCode, setPostalCode] = React.useState("");
  const [city, setCity] = React.useState("");
  const [country, setCountry] = React.useState("");
  const [latitude, setLatitude] = React.useState("");
  const [longitude, setLongitude] = React.useState("");

  const applyProfileData = React.useCallback((data: UserResponse) => {
    setFirstName(data.first_name ?? "");
    setLastName(data.last_name ?? "");
    setPhone(data.phone ?? "");
    setNationalId(data.national_id ?? "");
    setAddressLine(data.address_line ?? "");
    setPostalCode(data.postal_code ?? "");
    setCity(data.city ?? "");
    setCountry(data.country ?? "");
    setLatitude(data.latitude != null ? String(data.latitude) : "");
    setLongitude(data.longitude != null ? String(data.longitude) : "");
  }, []);

  const fetchProfile = React.useCallback(async () => {
    const data = await getMeUser(api);
    applyProfileData(data);
  }, [api, applyProfileData]);

  const { execute: loadProfile, loading: loadingProfile } = useAsyncOperation({
    alertTitle: "Load Profile",
  });

  const { execute: handleLocationUpdate, loading: locating } = useAsyncOperation({
    alertTitle: "Location Update",
  });

  const { execute: handleProfileSave, loading: saving } = useAsyncOperation({
    alertTitle: "Save Profile",
    onSuccess: () => {
      refresh();
      loadProfile(fetchProfile);
    },
  });

  useEffect(() => {
    loadProfile(fetchProfile);
  }, [fetchProfile]);

  async function useCurrentLocation() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      throw new Error("Location permission is required.");
    }

    const pos = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    setLatitude(String(pos.coords.latitude));
    setLongitude(String(pos.coords.longitude));
  }

  async function saveProfile() {
    const { latitude: parsedLatitude, longitude: parsedLongitude } =
      parseOptionalCoordinates(latitude, longitude);

    await updateMe(api, {
      first_name: toNullableString(firstName),
      last_name: toNullableString(lastName),
      phone: toNullableString(phone),
      national_id: toNullableString(nationalId),
      address_line: toNullableString(addressLine),
      postal_code: toNullableString(postalCode),
      city: toNullableString(city),
      country: toNullableString(country),
      latitude: parsedLatitude,
      longitude: parsedLongitude,
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
        <CardTitle
          title="User details"
          action={<AppButton label="Refresh" onPress={() => loadProfile(fetchProfile)} style={{ minWidth: 110 }} />}
        />

        {loadingProfile ? (
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
              <Label>Location</Label>
              <ButtonRow>
                <AppInput
                  value={latitude}
                  onChangeText={setLatitude}
                  placeholder="Latitude"
                  keyboardType="decimal-pad"
                  style={{ flex: 1 }}
                />
                <AppInput
                  value={longitude}
                  onChangeText={setLongitude}
                  placeholder="Longitude"
                  keyboardType="decimal-pad"
                  style={{ flex: 1 }}
                />
              </ButtonRow>

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