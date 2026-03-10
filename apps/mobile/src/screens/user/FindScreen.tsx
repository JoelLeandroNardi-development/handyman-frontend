import React, { useEffect, useMemo, useState } from "react";
import {
  SafeAreaView,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Alert,
  Modal,
  ScrollView,
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
import { useSession } from "../../auth/SessionProvider";

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
    <link
      rel="stylesheet"
      href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
    />
    <style>
      html, body, #map {
        height: 100%;
        width: 100%;
        margin: 0;
        padding: 0;
        background: #f6f7fb;
      }
      .leaflet-container {
        font-family: sans-serif;
      }
    </style>
  </head>
  <body>
    <div id="map"></div>

    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script>
      const map = L.map("map", {
        zoomControl: true,
        attributionControl: true
      }).setView([${center.latitude}, ${center.longitude}], ${results.length > 0 ? 12 : 10});

      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap contributors"
      }).addTo(map);

      ${markersJs}

      const allPoints = [];
      ${
        userCoords
          ? `allPoints.push([${userCoords.latitude}, ${userCoords.longitude}]);`
          : ""
      }

      ${results
        .map((m) => `allPoints.push([${m.latitude}, ${m.longitude}]);`)
        .join("\n")}

      if (allPoints.length > 1) {
        map.fitBounds(allPoints, { padding: [30, 30] });
      }
    </script>
  </body>
</html>
  `;
}

function formatDateLabel(value: Date) {
  return value.toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTimeLabel(value: Date) {
  return value.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function combineDateAndTime(datePart: Date, timePart: Date) {
  const next = new Date(datePart);
  next.setHours(timePart.getHours(), timePart.getMinutes(), 0, 0);
  return next;
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
  const { session } = useSession();

  const [userCoords, setUserCoords] = useState<Coords | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);

  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [catalog, setCatalog] = useState<SkillCatalogFlatResponse | null>(null);
  const [selectedSkillKey, setSelectedSkillKey] = useState<string>("");

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [startTime, setStartTime] = useState<Date>(() => {
    const d = new Date();
    d.setHours(d.getHours() + 1, 0, 0, 0);
    return d;
  });
  const [endTime, setEndTime] = useState<Date>(() => {
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

  const desiredStartDate = useMemo(
    () => combineDateAndTime(selectedDate, startTime),
    [selectedDate, startTime]
  );
  const desiredEndDate = useMemo(
    () => combineDateAndTime(selectedDate, endTime),
    [selectedDate, endTime]
  );

  const skillOptions = useMemo(() => flattenSkills(catalog), [catalog]);
  const selectedSkill = useMemo(
    () => skillOptions.find((s) => s.key === selectedSkillKey) ?? null,
    [skillOptions, selectedSkillKey]
  );

  const mapHtml = useMemo(() => buildMapHtml(userCoords, results), [userCoords, results]);

  useEffect(() => {
    loadCatalog();
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
    if (event.type === "dismissed") {
      setPickerTarget(null);
      return;
    }
    if (!value) {
      setPickerTarget(null);
      return;
    }

    if (pickerTarget === "date") {
      setSelectedDate(value);
    } else if (pickerTarget === "start") {
      setStartTime(value);
    } else if (pickerTarget === "end") {
      setEndTime(value);
    }
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
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f6f7fb" }}>
      <View style={{ padding: 12, gap: 10 }}>
        <Text style={{ fontSize: 20, fontWeight: "700" }}>Find a handyman</Text>
        <Text style={{ opacity: 0.7 }}>Choose a skill, time window, and search nearby pros.</Text>

        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 14,
            borderWidth: 1,
            borderColor: "#e6e8ef",
            padding: 12,
            gap: 10,
          }}
        >
          <View style={{ gap: 6 }}>
            <Text style={{ fontWeight: "600" }}>Skill</Text>
            <TouchableOpacity
              onPress={() => setSkillModalOpen(true)}
              style={{
                borderWidth: 1,
                borderColor: "#ddd",
                borderRadius: 10,
                padding: 12,
                backgroundColor: "#fff",
              }}
            >
              <Text style={{ fontWeight: selectedSkill ? "600" : "400" }}>
                {loadingCatalog
                  ? "Loading skills..."
                  : selectedSkill
                    ? `${selectedSkill.categoryLabel} • ${selectedSkill.label}`
                    : "Choose a skill"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={{ gap: 6 }}>
            <Text style={{ fontWeight: "600" }}>Date</Text>
            <TouchableOpacity
              onPress={() => setPickerTarget("date")}
              style={{
                borderWidth: 1,
                borderColor: "#ddd",
                borderRadius: 10,
                padding: 12,
                backgroundColor: "#fff",
              }}
            >
              <Text>{formatDateLabel(selectedDate)}</Text>
            </TouchableOpacity>
          </View>

          <View style={{ flexDirection: "row", gap: 10 }}>
            <View style={{ flex: 1, gap: 6 }}>
              <Text style={{ fontWeight: "600" }}>Start</Text>
              <TouchableOpacity
                onPress={() => setPickerTarget("start")}
                style={{
                  borderWidth: 1,
                  borderColor: "#ddd",
                  borderRadius: 10,
                  padding: 12,
                  backgroundColor: "#fff",
                }}
              >
                <Text>{formatTimeLabel(startTime)}</Text>
              </TouchableOpacity>
            </View>

            <View style={{ flex: 1, gap: 6 }}>
              <Text style={{ fontWeight: "600" }}>End</Text>
              <TouchableOpacity
                onPress={() => setPickerTarget("end")}
                style={{
                  borderWidth: 1,
                  borderColor: "#ddd",
                  borderRadius: 10,
                  padding: 12,
                  backgroundColor: "#fff",
                }}
              >
                <Text>{formatTimeLabel(endTime)}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View
            style={{
              backgroundColor: "#f8fafc",
              borderRadius: 10,
              borderWidth: 1,
              borderColor: "#e6e8ef",
              padding: 10,
            }}
          >
            <Text style={{ opacity: 0.8 }}>
              Requested window: {desiredStartDate.toLocaleString()} → {desiredEndDate.toLocaleString()}
            </Text>
          </View>

          <View style={{ flexDirection: "row", gap: 10 }}>
            <TouchableOpacity
              onPress={getLocation}
              style={{
                flex: 1,
                backgroundColor: "#111827",
                padding: 12,
                borderRadius: 12,
                alignItems: "center",
              }}
            >
              {loadingLocation ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={{ color: "#fff", fontWeight: "700" }}>
                  {userCoords ? "Update location" : "Use my location"}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={runMatch}
              style={{
                flex: 1,
                backgroundColor: userCoords && selectedSkillKey ? "#2563eb" : "#93c5fd",
                padding: 12,
                borderRadius: 12,
                alignItems: "center",
              }}
              disabled={!userCoords || !selectedSkillKey || loadingMatch}
            >
              {loadingMatch ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={{ color: "#fff", fontWeight: "700" }}>Match</Text>
              )}
            </TouchableOpacity>
          </View>

          {bookingSuccess ? (
            <View
              style={{
                backgroundColor: "#ecfdf5",
                borderWidth: 1,
                borderColor: "#a7f3d0",
                borderRadius: 10,
                padding: 10,
              }}
            >
              <Text style={{ color: "#065f46", fontWeight: "600" }}>{bookingSuccess}</Text>
            </View>
          ) : null}
        </View>
      </View>

      {pickerTarget ? (
        <DateTimePicker
          value={
            pickerTarget === "date"
              ? selectedDate
              : pickerTarget === "start"
                ? startTime
                : endTime
          }
          mode={pickerTarget === "date" ? "date" : "time"}
          is24Hour
          onChange={onPickerChange}
        />
      ) : null}

      <View style={{ flex: 1 }}>
        <View
          style={{
            flex: 1,
            marginHorizontal: 12,
            borderRadius: 16,
            overflow: "hidden",
            borderWidth: 1,
            borderColor: "#e6e8ef",
            backgroundColor: "#fff",
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
                <ActivityIndicator />
              </View>
            )}
          />
        </View>

        <View
          style={{
            position: "absolute",
            left: 12,
            right: 12,
            bottom: 12,
            backgroundColor: "#fff",
            borderRadius: 16,
            borderWidth: 1,
            borderColor: "#e6e8ef",
            padding: 12,
            maxHeight: 260,
          }}
        >
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" }}>
            <Text style={{ fontWeight: "800" }}>Top matches</Text>
            <Text style={{ opacity: 0.6, fontSize: 12 }}>{results.length} results</Text>
          </View>

          {!userCoords ? (
            <Text style={{ marginTop: 10, opacity: 0.7 }}>Tap “Use my location” to start.</Text>
          ) : loadingMatch ? (
            <View style={{ marginTop: 12 }}>
              <ActivityIndicator />
            </View>
          ) : results.length === 0 ? (
            <Text style={{ marginTop: 10, opacity: 0.7 }}>No results yet. Tap Match.</Text>
          ) : (
            <FlatList
              style={{ marginTop: 10 }}
              data={results}
              keyExtractor={(item) => item.email}
              renderItem={({ item }) => {
                const isSelected = item.email === selectedEmail;
                return (
                  <TouchableOpacity
                    onPress={() => setSelectedEmail(item.email)}
                    style={{
                      padding: 10,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: isSelected ? "#2563eb" : "#eef0f6",
                      backgroundColor: isSelected ? "#eff6ff" : "#fff",
                      marginBottom: 8,
                    }}
                  >
                    <Text style={{ fontWeight: "700" }}>{item.email}</Text>
                    <Text style={{ opacity: 0.75, marginTop: 2 }}>
                      {item.distance_km.toFixed(1)} km • {item.years_experience} yrs
                      {item.availability_unknown ? " • availability unknown" : ""}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
          )}
        </View>
      </View>

      <Modal visible={skillModalOpen} transparent animationType="slide" onRequestClose={() => setSkillModalOpen(false)}>
        <View
          style={{
            flex: 1,
            justifyContent: "flex-end",
            backgroundColor: "rgba(0,0,0,0.25)",
          }}
        >
          <View
            style={{
              backgroundColor: "#fff",
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              maxHeight: "70%",
              padding: 16,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "800", marginBottom: 10 }}>Choose a skill</Text>

            <ScrollView>
              {catalog?.categories.map((category) => {
                const activeSkills = category.skills.filter((s) => s.active);
                if (activeSkills.length === 0) return null;

                return (
                  <View key={category.key} style={{ marginBottom: 16 }}>
                    <Text style={{ fontWeight: "800", marginBottom: 8 }}>{category.label}</Text>

                    {activeSkills.map((skill) => {
                      const selectedRow = selectedSkillKey === skill.key;
                      return (
                        <TouchableOpacity
                          key={skill.key}
                          onPress={() => {
                            setSelectedSkillKey(skill.key);
                            setSkillModalOpen(false);
                          }}
                          style={{
                            padding: 12,
                            borderWidth: 1,
                            borderColor: selectedRow ? "#2563eb" : "#e6e8ef",
                            backgroundColor: selectedRow ? "#eff6ff" : "#fff",
                            borderRadius: 12,
                            marginBottom: 8,
                          }}
                        >
                          <Text style={{ fontWeight: "600" }}>{skill.label}</Text>
                          <Text style={{ opacity: 0.65, marginTop: 2 }}>{skill.key}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                );
              })}
            </ScrollView>

            <TouchableOpacity
              onPress={() => setSkillModalOpen(false)}
              style={{
                marginTop: 8,
                backgroundColor: "#111827",
                padding: 12,
                borderRadius: 12,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "700" }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={!!selected} transparent animationType="slide" onRequestClose={() => setSelectedEmail(null)}>
        <View
          style={{
            flex: 1,
            justifyContent: "flex-end",
            backgroundColor: "rgba(0,0,0,0.25)",
          }}
        >
          <View
            style={{
              backgroundColor: "#fff",
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              padding: 16,
              gap: 10,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "800" }}>Confirm booking</Text>

            {selected ? (
              <>
                <Text style={{ opacity: 0.8 }}>Handyman: {selected.email}</Text>
                <Text style={{ opacity: 0.8 }}>
                  Skill: {selectedSkill ? `${selectedSkill.categoryLabel} • ${selectedSkill.label}` : selectedSkillKey}
                </Text>
                <Text style={{ opacity: 0.8 }}>Distance: {selected.distance_km.toFixed(1)} km</Text>
                <Text style={{ opacity: 0.8 }}>Experience: {selected.years_experience} yrs</Text>
                <Text style={{ opacity: 0.8 }}>
                  Availability: {selected.availability_unknown ? "Unknown" : "Known"}
                </Text>

                <View
                  style={{
                    backgroundColor: "#f8fafc",
                    borderWidth: 1,
                    borderColor: "#e6e8ef",
                    borderRadius: 12,
                    padding: 12,
                  }}
                >
                  <Text style={{ fontWeight: "700", marginBottom: 6 }}>Requested window</Text>
                  <Text>{desiredStartDate.toLocaleString()}</Text>
                  <Text>{desiredEndDate.toLocaleString()}</Text>
                </View>
              </>
            ) : null}

            <View style={{ flexDirection: "row", gap: 10 }}>
              <TouchableOpacity
                onPress={() => setSelectedEmail(null)}
                style={{
                  flex: 1,
                  backgroundColor: "#e5e7eb",
                  padding: 12,
                  borderRadius: 12,
                  alignItems: "center",
                }}
              >
                <Text style={{ fontWeight: "700" }}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onConfirmBooking}
                disabled={creatingBooking}
                style={{
                  flex: 1,
                  backgroundColor: "#111827",
                  padding: 12,
                  borderRadius: 12,
                  alignItems: "center",
                }}
              >
                {creatingBooking ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={{ color: "#fff", fontWeight: "800" }}>Confirm request</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}