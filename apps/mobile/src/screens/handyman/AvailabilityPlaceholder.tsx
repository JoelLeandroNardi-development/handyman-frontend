import React, { useEffect, useMemo, useState } from "react";
import {
  SafeAreaView,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  FlatList,
  TextInput,
} from "react-native";
import {
  clearMyAvailability,
  getMyAvailability,
  setMyAvailability,
  type AvailabilitySlot,
} from "@smart/api";
import { createApiClient } from "../../lib/api";

function formatDate(value?: string) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString();
}

function normalizeAvailability(data: unknown): AvailabilitySlot[] {
  if (!data) return [];

  if (Array.isArray(data)) {
    return data.filter(
      (x): x is AvailabilitySlot =>
        !!x &&
        typeof x === "object" &&
        "start" in x &&
        "end" in x &&
        typeof (x as { start?: unknown }).start === "string" &&
        typeof (x as { end?: unknown }).end === "string"
    );
  }

  if (typeof data === "object" && data !== null) {
    const maybeSlots = (data as { slots?: unknown }).slots;
    if (Array.isArray(maybeSlots)) {
      return maybeSlots.filter(
        (x): x is AvailabilitySlot =>
          !!x &&
          typeof x === "object" &&
          "start" in x &&
          "end" in x &&
          typeof (x as { start?: unknown }).start === "string" &&
          typeof (x as { end?: unknown }).end === "string"
      );
    }
  }

  return [];
}

function sortSlots(slots: AvailabilitySlot[]) {
  return [...slots].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
}

export default function AvailabilityPlaceholder() {
  const api = useMemo(() => createApiClient(), []);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [clearing, setClearing] = useState(false);

  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [draftStart, setDraftStart] = useState(new Date(Date.now() + 60 * 60 * 1000).toISOString());
  const [draftEnd, setDraftEnd] = useState(new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString());

  async function loadAvailability() {
    setLoading(true);
    try {
      const data = await getMyAvailability(api);
      setSlots(sortSlots(normalizeAvailability(data)));
    } catch (e) {
      Alert.alert("Could not load availability", (e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAvailability();
  }, []);

  function addDraftSlot() {
    if (!draftStart.trim() || !draftEnd.trim()) {
      Alert.alert("Missing values", "Please enter both start and end.");
      return;
    }

    const start = new Date(draftStart);
    const end = new Date(draftEnd);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      Alert.alert("Invalid date", "Please use valid ISO date strings.");
      return;
    }

    if (end <= start) {
      Alert.alert("Invalid range", "End must be after start.");
      return;
    }

    const next: AvailabilitySlot = {
      start: start.toISOString(),
      end: end.toISOString(),
    };

    setSlots((prev) => sortSlots([...prev, next]));
    setDraftStart(new Date(end.getTime() + 60 * 60 * 1000).toISOString());
    setDraftEnd(new Date(end.getTime() + 2 * 60 * 60 * 1000).toISOString());
  }

  function removeSlot(index: number) {
    setSlots((prev) => prev.filter((_, i) => i !== index));
  }

  async function saveAvailability() {
    setSaving(true);
    try {
      await setMyAvailability(api, { slots });
      Alert.alert("Availability saved", `Saved ${slots.length} slot(s).`);
      await loadAvailability();
    } catch (e) {
      Alert.alert("Save failed", (e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function clearAvailability() {
    setClearing(true);
    try {
      await clearMyAvailability(api);
      setSlots([]);
      Alert.alert("Availability cleared", "All slots were removed.");
    } catch (e) {
      Alert.alert("Clear failed", (e as Error).message);
    } finally {
      setClearing(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f6f7fb" }}>
      <View style={{ padding: 16, gap: 12 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <View>
            <Text style={{ fontSize: 20, fontWeight: "700" }}>Availability</Text>
            <Text style={{ opacity: 0.7 }}>Manage the time slots you can accept jobs</Text>
          </View>

          <TouchableOpacity
            onPress={loadAvailability}
            style={{
              backgroundColor: "#111827",
              paddingHorizontal: 12,
              paddingVertical: 10,
              borderRadius: 12,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "700" }}>Refresh</Text>
          </TouchableOpacity>
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
          <Text style={{ fontWeight: "700" }}>Add slot</Text>

          <View style={{ gap: 6 }}>
            <Text style={{ fontWeight: "600" }}>Start (ISO)</Text>
            <TextInput
              value={draftStart}
              onChangeText={setDraftStart}
              autoCapitalize="none"
              style={{
                borderWidth: 1,
                borderColor: "#ddd",
                borderRadius: 10,
                padding: 10,
                backgroundColor: "#fff",
              }}
            />
          </View>

          <View style={{ gap: 6 }}>
            <Text style={{ fontWeight: "600" }}>End (ISO)</Text>
            <TextInput
              value={draftEnd}
              onChangeText={setDraftEnd}
              autoCapitalize="none"
              style={{
                borderWidth: 1,
                borderColor: "#ddd",
                borderRadius: 10,
                padding: 10,
                backgroundColor: "#fff",
              }}
            />
          </View>

          <TouchableOpacity
            onPress={addDraftSlot}
            style={{
              backgroundColor: "#2563eb",
              padding: 12,
              borderRadius: 12,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "700" }}>Add slot locally</Text>
          </TouchableOpacity>

          <Text style={{ opacity: 0.65 }}>
            Tip: for now this screen uses ISO datetimes directly. We can replace this with proper date/time pickers later.
          </Text>
        </View>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator />
        </View>
      ) : (
        <FlatList
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
          ListHeaderComponent={
            <View style={{ marginBottom: 12 }}>
              <Text style={{ fontSize: 16, fontWeight: "800" }}>Current slots</Text>
            </View>
          }
          data={slots}
          keyExtractor={(item, index) => `${item.start}-${item.end}-${index}`}
          ListEmptyComponent={
            <View
              style={{
                backgroundColor: "#fff",
                borderWidth: 1,
                borderColor: "#e6e8ef",
                borderRadius: 14,
                padding: 14,
              }}
            >
              <Text style={{ opacity: 0.7 }}>No availability slots yet.</Text>
            </View>
          }
          renderItem={({ item, index }) => (
            <View
              style={{
                backgroundColor: "#fff",
                borderWidth: 1,
                borderColor: "#e6e8ef",
                borderRadius: 14,
                padding: 14,
                marginBottom: 10,
              }}
            >
              <Text style={{ fontWeight: "700" }}>Slot {index + 1}</Text>
              <Text style={{ opacity: 0.8, marginTop: 6 }}>Start: {formatDate(item.start)}</Text>
              <Text style={{ opacity: 0.8, marginTop: 2 }}>End: {formatDate(item.end)}</Text>

              <TouchableOpacity
                onPress={() => removeSlot(index)}
                style={{
                  marginTop: 10,
                  backgroundColor: "#e5e7eb",
                  padding: 10,
                  borderRadius: 10,
                  alignItems: "center",
                }}
              >
                <Text style={{ fontWeight: "700" }}>Remove</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      <View
        style={{
          padding: 16,
          borderTopWidth: 1,
          borderTopColor: "#e6e8ef",
          backgroundColor: "#fff",
          flexDirection: "row",
          gap: 10,
        }}
      >
        <TouchableOpacity
          onPress={clearAvailability}
          disabled={clearing}
          style={{
            flex: 1,
            backgroundColor: clearing ? "#fca5a5" : "#dc2626",
            padding: 12,
            borderRadius: 12,
            alignItems: "center",
          }}
        >
          {clearing ? (
            <ActivityIndicator />
          ) : (
            <Text style={{ color: "#fff", fontWeight: "700" }}>Clear all</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={saveAvailability}
          disabled={saving}
          style={{
            flex: 1,
            backgroundColor: "#111827",
            padding: 12,
            borderRadius: 12,
            alignItems: "center",
          }}
        >
          {saving ? (
            <ActivityIndicator />
          ) : (
            <Text style={{ color: "#fff", fontWeight: "700" }}>Save slots</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}