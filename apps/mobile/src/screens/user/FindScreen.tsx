import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ScrollView,
  Text,
  View,
} from "react-native";
import * as Location from "expo-location";
import { WebView } from "react-native-webview";
import DateTimePicker, { type DateTimePickerEvent } from "@react-native-community/datetimepicker";
import {
  createBooking,
  getSkillsCatalogFlat,
  match,
  type MatchResult,
  type SkillCatalogFlatResponse,
} from "@smart/api";
import { createApiClient } from "../../lib/api";
import {
  combineDateAndTime,
  formatDateLabel,
  formatTimeLabel,
} from "../../lib/dateTime";
import { useSession } from "../../auth/SessionProvider";
import { useTheme } from "../../theme";
import {
  AppButton,
  BottomSheet,
  ButtonRow,
  Card,
  InputButton,
  Label,
  PageHeader,
  Screen,
} from "../../ui/primitives";

type Coords = { latitude: number; longitude: number };
type PickerTarget = "date" | "start" | "end" | null;

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function buildMapHtml(userCoords: Coords | null, results: MatchResult[]) {
  const center = userCoords ?? { latitude: 37.7749, longitude: -122.4194 };

  const markersJs = [
    userCoords
      ? `
        L.marker([${userCoords.latitude}, ${userCoords.longitude}])
          .addTo(map)
          .bindPopup("You");
      `
      : "",
    ...results.map((m) => {
      const popup = escapeHtml(
        `${m.email} • ${m.distance_km.toFixed(1)} km • ${m.years_experience} yrs${
          m.availability_unknown ? " • availability unknown" : ""
        }`
      );

      return `
        L.marker([${m.latitude}, ${m.longitude}])
          .addTo(map)
          .bindPopup("${popup}");
      `;
    }),
  ].join("\n");

  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
    />
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <style>
      html, body, #map {
        height: 100%;
        width: 100%;
        margin: 0;
        padding: 0;
        background: #f6f7fb;
      }
      .leaflet-container { font-family: sans-serif; }
    </style>
  </head>
  <body>
    <div id="map"></div>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script>
      const map = L.map("map", { zoomControl: true, attributionControl: true })
        .setView([${center.latitude}, ${center.longitude}], ${results.length > 0 ? 12 : 10});

      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap contributors"
      }).addTo(map);

      ${markersJs}

      const allPoints = [];
      ${userCoords ? `allPoints.push([${userCoords.latitude}, ${userCoords.longitude}]);` : ""}
      ${results.map((m) => `allPoints.push([${m.latitude}, ${m.longitude}]);`).join("\n")}

      if (allPoints.length > 1) {
        map.fitBounds(allPoints, { padding: [30, 30] });
      }
    </script>
  </body>
</html>
  `;
}

type SkillOption = {
  key: string;
  label: string;
  categoryKey: string;
  categoryLabel: string;
};

function flattenSkills(catalog: SkillCatalogFlatResponse | null): SkillOption[] {
  if (!catalog) return [];

  const out: SkillOption[] = [];
  for (const category of catalog.categories) {
    for (const skill of category.skills) {
      if (!skill.active) continue;
      out.push({
        key: skill.key,
        label: skill.label,
        categoryKey: category.key,
        categoryLabel: category.label,
      });
    }
  }
  return out;
}

export default function FindScreen() {
  const api = useMemo(() => createApiClient(), []);
  const { colors } = useTheme();
  const { session } = useSession();

  const [userCoords, setUserCoords] = useState<Coords | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);

  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [catalog, setCatalog] = useState<SkillCatalogFlatResponse | null>(null);
  const [selectedSkillKey, setSelectedSkillKey] = useState("");

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [startTime, setStartTime] = useState(() => {
    const d = new Date();
    d.setHours(d.getHours() + 1, 0, 0, 0);
    return d;
  });
  const [endTime, setEndTime] = useState(() => {
    const d = new Date();
    d.setHours(d.getHours() + 2, 0, 0, 0);
    return d;
  });

  const [pickerTarget, setPickerTarget] = useState<PickerTarget>(null);
  const [skillModalOpen, setSkillModalOpen] = useState(false);

  const [loadingMatch, setLoadingMatch] = useState(false);
  const [creatingBooking, setCreatingBooking] = useState(false);
  const [results, setResults] = useState<MatchResult[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);

  const currentUserEmail = session?.email ?? "";
  const selected = results.find((r) => r.email === selectedEmail) ?? null;

  const desiredStartDate = useMemo(() => combineDateAndTime(selectedDate, startTime), [selectedDate, startTime]);
  const desiredEndDate = useMemo(() => combineDateAndTime(selectedDate, endTime), [selectedDate, endTime]);

  const skillOptions = useMemo(() => flattenSkills(catalog), [catalog]);
  const selectedSkill = useMemo(
    () => skillOptions.find((s) => s.key === selectedSkillKey) ?? null,
    [skillOptions, selectedSkillKey]
  );

  const mapHtml = useMemo(() => buildMapHtml(userCoords, results), [userCoords, results]);

  useEffect(() => {
    void loadCatalog();
  }, []);

  async function loadCatalog() {
    setLoadingCatalog(true);
    try {
      const data = await getSkillsCatalogFlat(api, { active_only: true });
      setCatalog(data);

      if (!selectedSkillKey && data.allowed_skill_keys.length > 0) {
        setSelectedSkillKey(data.allowed_skill_keys[0]);
      }
    } catch (e) {
      Alert.alert("Could not load skills", (e as Error).message);
    } finally {
      setLoadingCatalog(false);
    }
  }

  async function getLocation() {
    setLoadingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Location permission", "Permission denied.");
        return;
      }

      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setUserCoords({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });
    } catch (e) {
      Alert.alert("Location error", (e as Error).message);
    } finally {
      setLoadingLocation(false);
    }
  }

  function onPickerChange(event: DateTimePickerEvent, value?: Date) {
    if (event.type === "dismissed" || !value) {
      setPickerTarget(null);
      return;
    }

    if (pickerTarget === "date") setSelectedDate(value);
    if (pickerTarget === "start") setStartTime(value);
    if (pickerTarget === "end") setEndTime(value);

    setPickerTarget(null);
  }

  async function runMatch() {
    if (!userCoords) {
      Alert.alert("Location required", "Tap “Use my location” first.");
      return;
    }
    if (!selectedSkillKey) {
      Alert.alert("Missing skill", "Please choose a skill.");
      return;
    }
    if (desiredEndDate <= desiredStartDate) {
      Alert.alert("Invalid time range", "End time must be after start time.");
      return;
    }

    setLoadingMatch(true);
    setSelectedEmail(null);
    setBookingSuccess(null);

    try {
      const res = await match(api, {
        latitude: userCoords.latitude,
        longitude: userCoords.longitude,
        skill: selectedSkillKey,
        desired_start: desiredStartDate.toISOString(),
        desired_end: desiredEndDate.toISOString(),
      });
      setResults(res);
    } catch (e) {
      Alert.alert("Match failed", (e as Error).message);
    } finally {
      setLoadingMatch(false);
    }
  }

  async function onConfirmBooking() {
    if (!selectedEmail) return;
    if (!currentUserEmail) {
      Alert.alert("Missing user email", "Could not determine current user from /me.");
      return;
    }
    if (desiredEndDate <= desiredStartDate) {
      Alert.alert("Invalid time range", "End time must be after start time.");
      return;
    }

    setCreatingBooking(true);
    try {
      const booking = await createBooking(api, {
        user_email: currentUserEmail,
        handyman_email: selectedEmail,
        desired_start: desiredStartDate.toISOString(),
        desired_end: desiredEndDate.toISOString(),
      });

      setBookingSuccess(`Booking created: ${booking.booking_id}`);
      setSelectedEmail(null);

      Alert.alert(
        "Booking created",
        `Status: ${booking.status}\nBooking ID: ${booking.booking_id}`
      );
    } catch (e) {
      Alert.alert("Booking failed", (e as Error).message);
    } finally {
      setCreatingBooking(false);
    }
  }

  return (
    <>
      <Screen>
        {pickerTarget ? (
          <DateTimePicker
            value={pickerTarget === "date" ? selectedDate : pickerTarget === "start" ? startTime : endTime}
            mode={pickerTarget === "date" ? "date" : "time"}
            is24Hour
            onChange={onPickerChange}
          />
        ) : null}

        <View style={{ padding: 16, gap: 12 }}>
          <PageHeader
            title="Find a handyman"
            subtitle="Choose a skill, time window, and search nearby pros."
          />

          <Card>
            <View style={{ gap: 8 }}>
              <Label>Skill</Label>
              <InputButton
                label={
                  loadingCatalog
                    ? "Loading skills..."
                    : selectedSkill
                      ? `${selectedSkill.categoryLabel} • ${selectedSkill.label}`
                      : "Choose a skill"
                }
                onPress={() => setSkillModalOpen(true)}
              />
            </View>

            <View style={{ gap: 8 }}>
              <Label>Date</Label>
              <InputButton label={formatDateLabel(selectedDate)} onPress={() => setPickerTarget("date")} />
            </View>

            <ButtonRow>
              <View style={{ flex: 1, gap: 8 }}>
                <Label>Start</Label>
                <InputButton label={formatTimeLabel(startTime)} onPress={() => setPickerTarget("start")} />
              </View>

              <View style={{ flex: 1, gap: 8 }}>
                <Label>End</Label>
                <InputButton label={formatTimeLabel(endTime)} onPress={() => setPickerTarget("end")} />
              </View>
            </ButtonRow>

            <View
              style={{
                backgroundColor: colors.surfaceMuted,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: colors.border,
                padding: 12,
              }}
            >
              <Text style={{ color: colors.textSoft }}>
                Requested window: {desiredStartDate.toLocaleString()} → {desiredEndDate.toLocaleString()}
              </Text>
            </View>

            <ButtonRow>
              <AppButton
                label={userCoords ? "Update location" : "Use my location"}
                onPress={getLocation}
                loading={loadingLocation}
                style={{ flex: 1 }}
              />
              <AppButton
                label="Match"
                onPress={runMatch}
                loading={loadingMatch}
                disabled={!userCoords || !selectedSkillKey}
                style={{ flex: 1 }}
              />
            </ButtonRow>

            {bookingSuccess ? (
              <View
                style={{
                  backgroundColor: colors.successSoft,
                  borderColor: colors.success,
                  borderWidth: 1,
                  borderRadius: 16,
                  padding: 12,
                }}
              >
                <Text style={{ color: colors.success, fontWeight: "700" }}>{bookingSuccess}</Text>
              </View>
            ) : null}
          </Card>
        </View>

        <View style={{ flex: 1, paddingHorizontal: 16, paddingBottom: 16 }}>
          <View
            style={{
              flex: 1,
              borderRadius: 20,
              overflow: "hidden",
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.surface,
            }}
          >
            <WebView
              originWhitelist={["*"]}
              source={{ html: mapHtml }}
              javaScriptEnabled
              domStorageEnabled
              startInLoadingState
              renderLoading={() => (
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                  <ActivityIndicator color={colors.primary} />
                </View>
              )}
            />
          </View>

          <View
            style={{
              position: "absolute",
              left: 16,
              right: 16,
              bottom: 16,
              backgroundColor: colors.surface,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: colors.border,
              padding: 14,
              maxHeight: 260,
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" }}>
              <Text style={{ fontWeight: "800", color: colors.text, fontSize: 16 }}>Top matches</Text>
              <Text style={{ color: colors.textFaint }}>{results.length} results</Text>
            </View>

            {!userCoords ? (
              <Text style={{ marginTop: 10, color: colors.textSoft }}>Tap “Use my location” to start.</Text>
            ) : loadingMatch ? (
              <View style={{ marginTop: 12 }}>
                <ActivityIndicator color={colors.primary} />
              </View>
            ) : results.length === 0 ? (
              <Text style={{ marginTop: 10, color: colors.textSoft }}>No results yet. Tap Match.</Text>
            ) : (
              <FlatList
                style={{ marginTop: 10 }}
                data={results}
                keyExtractor={(item) => item.email}
                renderItem={({ item }) => {
                  const isSelected = item.email === selectedEmail;

                  return (
                    <View style={{ marginBottom: 8 }}>
                      <AppButton
                        label={`${item.email} • ${item.distance_km.toFixed(1)} km • ${item.years_experience} yrs${item.availability_unknown ? " • unknown availability" : ""}`}
                        onPress={() => setSelectedEmail(item.email)}
                        tone={isSelected ? "primary" : "secondary"}
                      />
                    </View>
                  );
                }}
              />
            )}
          </View>
        </View>
      </Screen>

      <BottomSheet visible={skillModalOpen} onClose={() => setSkillModalOpen(false)} title="Choose a skill">
        <ScrollView>
          {catalog?.categories.map((category) => {
            const activeSkills = category.skills.filter((s) => s.active);
            if (activeSkills.length === 0) return null;

            return (
              <View key={category.key} style={{ marginBottom: 16, gap: 8 }}>
                <Text style={{ fontWeight: "800", color: colors.text, fontSize: 16 }}>{category.label}</Text>

                {activeSkills.map((skill) => {
                  const selectedRow = selectedSkillKey === skill.key;
                  return (
                    <AppButton
                      key={skill.key}
                      label={skill.label}
                      onPress={() => {
                        setSelectedSkillKey(skill.key);
                        setSkillModalOpen(false);
                      }}
                      tone={selectedRow ? "primary" : "secondary"}
                    />
                  );
                })}
              </View>
            );
          })}
        </ScrollView>

        <AppButton label="Close" onPress={() => setSkillModalOpen(false)} tone="secondary" />
      </BottomSheet>

      <BottomSheet visible={!!selected} onClose={() => setSelectedEmail(null)} title="Confirm booking">
        {selected ? (
          <>
            <Text style={{ color: colors.textSoft }}>Handyman: {selected.email}</Text>
            <Text style={{ color: colors.textSoft }}>
              Skill: {selectedSkill ? `${selectedSkill.categoryLabel} • ${selectedSkill.label}` : selectedSkillKey}
            </Text>
            <Text style={{ color: colors.textSoft }}>Distance: {selected.distance_km.toFixed(1)} km</Text>
            <Text style={{ color: colors.textSoft }}>Experience: {selected.years_experience} yrs</Text>
            <Text style={{ color: colors.textSoft }}>
              Availability: {selected.availability_unknown ? "Unknown" : "Known"}
            </Text>

            <View
              style={{
                backgroundColor: colors.surfaceMuted,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 16,
                padding: 12,
              }}
            >
              <Text style={{ fontWeight: "700", color: colors.text, marginBottom: 6 }}>Requested window</Text>
              <Text style={{ color: colors.textSoft }}>{desiredStartDate.toLocaleString()}</Text>
              <Text style={{ color: colors.textSoft }}>{desiredEndDate.toLocaleString()}</Text>
            </View>

            <ButtonRow>
              <AppButton
                label="Cancel"
                onPress={() => setSelectedEmail(null)}
                tone="secondary"
                style={{ flex: 1 }}
              />
              <AppButton
                label="Confirm request"
                onPress={onConfirmBooking}
                loading={creatingBooking}
                style={{ flex: 1 }}
              />
            </ButtonRow>
          </>
        ) : null}
      </BottomSheet>
    </>
  );
}