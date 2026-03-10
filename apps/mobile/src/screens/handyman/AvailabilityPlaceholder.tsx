import React, { useEffect, useMemo, useState } from "react";
import {
  SafeAreaView,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  FlatList,
} from "react-native";
import { useTheme } from "../../theme";
import DateTimePicker, { type DateTimePickerEvent } from "@react-native-community/datetimepicker";
import {
  clearMyAvailability,
  getMyAvailability,
  setMyAvailability,
  type AvailabilitySlot,
} from "@smart/api";
import { createApiClient } from "../../lib/api";

type PickerTarget = "date" | "start" | "end" | null;

function formatDate(value?: string) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString();
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
  const { colors } = useTheme();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [clearing, setClearing] = useState(false);

  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);

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

  function addDraftSlot() {
    const start = combineDateAndTime(selectedDate, startTime);
    const end = combineDateAndTime(selectedDate, endTime);

    if (end <= start) {
      Alert.alert("Invalid range", "End must be after start.");
      return;
    }

    const next: AvailabilitySlot = {
      start: start.toISOString(),
      end: end.toISOString(),
    };

    setSlots((prev) => sortSlots([...prev, next]));
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

  const previewStart = combineDateAndTime(selectedDate, startTime);
  const previewEnd = combineDateAndTime(selectedDate, endTime);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ padding: 16, gap: 12 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <View>
            <Text style={{ fontSize: 20, fontWeight: "700", color: colors.text }}>Availability</Text>
            <Text style={{ color: colors.textSoft, opacity: 0.9 }}>Manage the time slots you can accept jobs</Text>
          </View>

          <TouchableOpacity
            onPress={loadAvailability}
            style={{
              backgroundColor: colors.primary,
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
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 14,
            padding: 14,
            gap: 10,
          }}
        >
          <Text style={{ fontWeight: "700" }}>Add slot</Text>

          <View style={{ gap: 6 }}>
            <Text style={{ fontWeight: "600", color: colors.text }}>Date</Text>
            <TouchableOpacity
              onPress={() => setPickerTarget("date")}
              style={{
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 10,
                padding: 12,
                backgroundColor: colors.surface,
              }}
            >
              <Text>{formatDateLabel(selectedDate)}</Text>
            </TouchableOpacity>
          </View>

          <View style={{ flexDirection: "row", gap: 10 }}>
            <View style={{ flex: 1, gap: 6 }}>
              <Text style={{ fontWeight: "600", color: colors.text }}>Start</Text>
              <TouchableOpacity
                onPress={() => setPickerTarget("start")}
                style={{
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 10,
                  padding: 12,
                  backgroundColor: colors.surface,
                }}
              >
                <Text>{formatTimeLabel(startTime)}</Text>
              </TouchableOpacity>
            </View>

            <View style={{ flex: 1, gap: 6 }}>
              <Text style={{ fontWeight: "600", color: colors.text }}>End</Text>
              <TouchableOpacity
                onPress={() => setPickerTarget("end")}
                style={{
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 10,
                  padding: 12,
                  backgroundColor: colors.surface,
                }}
              >
                <Text>{formatTimeLabel(endTime)}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View
            style={{
              backgroundColor: colors.surfaceMuted,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: colors.border,
              padding: 10,
            }}
          >
            <Text style={{ opacity: 0.8 }}>
              Slot preview: {previewStart.toLocaleString()} → {previewEnd.toLocaleString()}
            </Text>
          </View>

          <TouchableOpacity
            onPress={addDraftSlot}
            style={{
              backgroundColor: colors.primary,
              padding: 12,
              borderRadius: 12,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "700" }}>Add slot locally</Text>
          </TouchableOpacity>
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
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
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
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 14,
                  padding: 14,
                  marginBottom: 10,
                }}
              >
                <Text style={{ fontWeight: "700", color: colors.text }}>Slot {index + 1}</Text>
                <Text style={{ color: colors.textSoft, marginTop: 6 }}>Start: {formatDate(item.start)}</Text>
                <Text style={{ color: colors.textSoft, marginTop: 2 }}>End: {formatDate(item.end)}</Text>
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
          borderTopColor: colors.border,
          backgroundColor: colors.surface,
          flexDirection: "row",
          gap: 10,
        }}
      >
        <TouchableOpacity
          onPress={clearAvailability}
          disabled={clearing}
          style={{
            flex: 1,
            backgroundColor: clearing ? "#fca5a5" : colors.danger,
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
            backgroundColor: colors.primary,
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