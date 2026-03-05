import React, { useMemo, useState } from "react";
import {
  SafeAreaView,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Alert,
} from "react-native";
import MapView, { Marker, UrlTile, Region } from "react-native-maps";
import * as Location from "expo-location";

import { match, type MatchResult } from "@smart/api";
import { createApiClient } from "../../lib/api";

type Coords = { latitude: number; longitude: number };

function kmToLatDelta(km: number) {
  // ~1 deg latitude ~111km
  return km / 111;
}

function offsetFromDistanceKm(base: Coords, distanceKm: number, seed: number): Coords {
  // Create a deterministic-ish bearing from seed, then place point around user by distance.
  // This is ONLY for MVP because match results do not include lat/lng.
  const bearing = (seed * 137.508) % 360; // pseudo-random
  const rad = (bearing * Math.PI) / 180;
  const latDelta = kmToLatDelta(distanceKm) * Math.cos(rad);
  const lonDelta = (kmToLatDelta(distanceKm) * Math.sin(rad)) / Math.cos((base.latitude * Math.PI) / 180);

  return {
    latitude: base.latitude + latDelta,
    longitude: base.longitude + lonDelta,
  };
}

export default function FindScreen() {
  const api = useMemo(() => createApiClient(), []);

  const [skill, setSkill] = useState("plumbing");
  const [desiredStart, setDesiredStart] = useState(new Date(Date.now() + 60 * 60 * 1000).toISOString());
  const [desiredEnd, setDesiredEnd] = useState(new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString());

  const [userCoords, setUserCoords] = useState<Coords | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);

  const [loadingMatch, setLoadingMatch] = useState(false);
  const [results, setResults] = useState<MatchResult[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);

  const region: Region = useMemo(() => {
    const base = userCoords ?? { latitude: 37.7749, longitude: -122.4194 }; // fallback
    return {
      latitude: base.latitude,
      longitude: base.longitude,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    };
  }, [userCoords]);

  async function getLocation() {
    setLoadingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Location permission", "Permission denied. Using fallback location.");
        setUserCoords(null);
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setUserCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
    } catch (e) {
      Alert.alert("Location error", (e as Error).message);
    } finally {
      setLoadingLocation(false);
    }
  }

  async function runMatch() {
    if (!userCoords) {
      Alert.alert("Location required", "Tap “Use my location” first (or allow location permission).");
      return;
    }
    if (!skill.trim()) {
      Alert.alert("Missing skill", "Please enter a skill.");
      return;
    }

    setLoadingMatch(true);
    setSelectedEmail(null);
    try {
      const res = await match(api, {
        latitude: userCoords.latitude,
        longitude: userCoords.longitude,
        skill: skill.trim(),
        desired_start: desiredStart,
        desired_end: desiredEnd,
      });
      setResults(res);
    } catch (e) {
      Alert.alert("Match failed", (e as Error).message);
    } finally {
      setLoadingMatch(false);
    }
  }

  const markers = useMemo(() => {
    if (!userCoords) return [];
    return results.map((r, idx) => ({
      ...r,
      coords: offsetFromDistanceKm(userCoords, Math.max(0.1, r.distance_km), idx + 1),
    }));
  }, [results, userCoords]);

  const selected = results.find((r) => r.email === selectedEmail) ?? null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f6f7fb" }}>
      {/* Header */}
      <View style={{ padding: 12, gap: 10 }}>
        <Text style={{ fontSize: 20, fontWeight: "700" }}>Find a handyman</Text>
        <Text style={{ opacity: 0.7 }}>Map-first discovery (OpenStreetMap tiles)</Text>

        <View style={{ backgroundColor: "#fff", borderRadius: 14, borderWidth: 1, borderColor: "#e6e8ef", padding: 12, gap: 10 }}>
          <View style={{ gap: 6 }}>
            <Text style={{ fontWeight: "600" }}>Skill</Text>
            <TextInput
              value={skill}
              onChangeText={setSkill}
              autoCapitalize="none"
              style={{ borderWidth: 1, borderColor: "#ddd", borderRadius: 10, padding: 10 }}
              placeholder="e.g. plumbing"
            />
          </View>

          <View style={{ gap: 6 }}>
            <Text style={{ fontWeight: "600" }}>Desired start (ISO)</Text>
            <TextInput
              value={desiredStart}
              onChangeText={setDesiredStart}
              autoCapitalize="none"
              style={{ borderWidth: 1, borderColor: "#ddd", borderRadius: 10, padding: 10 }}
            />
          </View>

          <View style={{ gap: 6 }}>
            <Text style={{ fontWeight: "600" }}>Desired end (ISO)</Text>
            <TextInput
              value={desiredEnd}
              onChangeText={setDesiredEnd}
              autoCapitalize="none"
              style={{ borderWidth: 1, borderColor: "#ddd", borderRadius: 10, padding: 10 }}
            />
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
                <ActivityIndicator />
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
                backgroundColor: userCoords ? "#2563eb" : "#93c5fd",
                padding: 12,
                borderRadius: 12,
                alignItems: "center",
              }}
              disabled={!userCoords || loadingMatch}
            >
              {loadingMatch ? <ActivityIndicator /> : <Text style={{ color: "#fff", fontWeight: "700" }}>Match</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Map + Bottom Panel */}
      <View style={{ flex: 1 }}>
        <MapView style={{ flex: 1 }} initialRegion={region} region={region}>
          {/* OpenStreetMap tiles */}
          <UrlTile
            urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            maximumZ={19}
          />

          {/* User marker */}
          {userCoords ? (
            <Marker
              coordinate={userCoords}
              title="You"
              description="Your location"
              pinColor="blue"
            />
          ) : null}

          {/* Match markers (approximate positions for MVP) */}
          {markers.map((m) => (
            <Marker
              key={m.email}
              coordinate={m.coords}
              title={m.email}
              description={`${m.distance_km.toFixed(1)} km • ${m.years_experience} yrs`}
              onPress={() => setSelectedEmail(m.email)}
            />
          ))}
        </MapView>

        {/* Bottom panel (simple MVP instead of draggable sheet) */}
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
            maxHeight: 240,
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
            <>
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

              {selected ? (
                <TouchableOpacity
                  onPress={() => Alert.alert("Next", "Next step: booking confirmation + POST /bookings")}
                  style={{
                    marginTop: 8,
                    backgroundColor: "#111827",
                    padding: 12,
                    borderRadius: 12,
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: "#fff", fontWeight: "800" }}>Request booking (next)</Text>
                </TouchableOpacity>
              ) : null}
            </>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}