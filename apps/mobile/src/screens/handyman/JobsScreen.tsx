import React, { useEffect, useMemo, useState } from "react";
import {
  SafeAreaView,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  TextInput,
} from "react-native";
import {
  cancelBooking,
  confirmBooking,
  getMyJobs,
  type BookingResponse,
} from "@smart/api";
import { createApiClient } from "../../lib/api";
import { useSession } from "../../auth/SessionProvider";

function formatDate(value?: string) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString();
}

function statusColor(status?: string) {
  switch ((status ?? "").toLowerCase()) {
    case "confirmed":
      return { bg: "#ecfdf5", border: "#a7f3d0", text: "#065f46" };
    case "pending":
      return { bg: "#fffbeb", border: "#fde68a", text: "#92400e" };
    case "cancelled":
      return { bg: "#fef2f2", border: "#fecaca", text: "#991b1b" };
    case "failed":
      return { bg: "#f3f4f6", border: "#d1d5db", text: "#374151" };
    default:
      return { bg: "#f8fafc", border: "#e5e7eb", text: "#334155" };
  }
}

export default function JobsScreen() {
  const api = useMemo(() => createApiClient(), []);
  const { session } = useSession();

  const handymanEmail = session?.email ?? "";

  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [selected, setSelected] = useState<BookingResponse | null>(null);
  const [cancelReason, setCancelReason] = useState("handyman_unavailable");
  const [confirming, setConfirming] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  async function loadBookings() {
    setLoading(true);
    try {
      const data = await getMyJobs(api, {
        limit: 100,
        offset: 0,
      });
      setBookings(data);
    } catch (e) {
      Alert.alert("Could not load jobs", (e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBookings();
  }, [handymanEmail]);

  const incoming = bookings.filter((b) => (b.status ?? "").toLowerCase() === "pending");
  const active = bookings.filter((b) => (b.status ?? "").toLowerCase() === "confirmed");
  const other = bookings.filter((b) => {
    const s = (b.status ?? "").toLowerCase();
    return s !== "pending" && s !== "confirmed";
  });

  async function onConfirm() {
    if (!selected) return;
    setConfirming(true);
    try {
      const res = await confirmBooking(api, selected.booking_id);
      Alert.alert("Booking confirmed", `Booking ${res.booking_id} is now ${res.status}.`);
      setSelected(null);
      await loadBookings();
    } catch (e) {
      Alert.alert("Confirm failed", (e as Error).message);
    } finally {
      setConfirming(false);
    }
  }

  async function onCancel() {
    if (!selected) return;
    setCancelling(true);
    try {
      const res = await cancelBooking(api, selected.booking_id, {
        reason: cancelReason || "handyman_unavailable",
      });
      Alert.alert("Booking cancelled", `Booking ${res.booking_id} is now ${res.status}.`);
      setSelected(null);
      await loadBookings();
    } catch (e) {
      Alert.alert("Cancel failed", (e as Error).message);
    } finally {
      setCancelling(false);
    }
  }

  function renderBookingCard(item: BookingResponse) {
    const colors = statusColor(item.status);

    return (
      <TouchableOpacity
        key={item.booking_id}
        onPress={() => {
          setCancelReason(item.cancellation_reason ?? "handyman_unavailable");
          setSelected(item);
        }}
        style={{
          backgroundColor: "#fff",
          borderRadius: 14,
          borderWidth: 1,
          borderColor: "#e6e8ef",
          padding: 14,
          marginBottom: 10,
        }}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
          <View style={{ flex: 1, paddingRight: 10 }}>
            <Text style={{ fontWeight: "800" }}>{item.user_email}</Text>
            <Text style={{ opacity: 0.65, marginTop: 4, fontFamily: "monospace" }}>
              {item.booking_id}
            </Text>
          </View>

          <View
            style={{
              backgroundColor: colors.bg,
              borderColor: colors.border,
              borderWidth: 1,
              borderRadius: 999,
              paddingHorizontal: 10,
              paddingVertical: 4,
            }}
          >
            <Text style={{ color: colors.text, fontSize: 12, fontWeight: "700" }}>{item.status}</Text>
          </View>
        </View>

        <View style={{ marginTop: 10, gap: 4 }}>
          <Text style={{ opacity: 0.8 }}>Start: {formatDate(item.desired_start)}</Text>
          <Text style={{ opacity: 0.8 }}>End: {formatDate(item.desired_end)}</Text>
          {item.cancellation_reason ? (
            <Text style={{ opacity: 0.7 }}>Cancel reason: {item.cancellation_reason}</Text>
          ) : null}
          {item.failure_reason ? (
            <Text style={{ opacity: 0.7 }}>Failure reason: {item.failure_reason}</Text>
          ) : null}
        </View>

        <Text style={{ marginTop: 10, color: "#2563eb", fontWeight: "700" }}>Open actions</Text>
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f6f7fb" }}>
      <View style={{ padding: 16, gap: 12 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <View>
            <Text style={{ fontSize: 20, fontWeight: "700" }}>Jobs</Text>
            <Text style={{ opacity: 0.7 }}>Incoming and active bookings</Text>
          </View>

          <TouchableOpacity
            onPress={loadBookings}
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
            padding: 12,
          }}
        >
          <Text style={{ fontWeight: "700" }}>Logged in as</Text>
          <Text style={{ opacity: 0.75, marginTop: 4 }}>{handymanEmail || "-"}</Text>
        </View>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator />
        </View>
      ) : (
        <FlatList
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
          data={[
            { section: "Incoming requests", items: incoming },
            { section: "Active jobs", items: active },
            { section: "Other", items: other },
          ]}
          keyExtractor={(item, index) => `${item.section}-${index}`}
          renderItem={({ item }) => (
            <View style={{ marginBottom: 18 }}>
              <Text style={{ fontSize: 16, fontWeight: "800", marginBottom: 10 }}>{item.section}</Text>

              {item.items.length === 0 ? (
                <View
                  style={{
                    backgroundColor: "#fff",
                    borderWidth: 1,
                    borderColor: "#e6e8ef",
                    borderRadius: 14,
                    padding: 14,
                  }}
                >
                  <Text style={{ opacity: 0.7 }}>No bookings in this section.</Text>
                </View>
              ) : (
                item.items.map(renderBookingCard)
              )}
            </View>
          )}
        />
      )}

      <Modal visible={!!selected} transparent animationType="slide" onRequestClose={() => setSelected(null)}>
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
            <Text style={{ fontSize: 18, fontWeight: "800" }}>Job actions</Text>

            {selected ? (
              <>
                <Text style={{ opacity: 0.85 }}>User: {selected.user_email}</Text>
                <Text style={{ opacity: 0.85 }}>Booking ID: {selected.booking_id}</Text>
                <Text style={{ opacity: 0.85 }}>Start: {formatDate(selected.desired_start)}</Text>
                <Text style={{ opacity: 0.85 }}>End: {formatDate(selected.desired_end)}</Text>
                <Text style={{ opacity: 0.85 }}>Status: {selected.status}</Text>

                <View
                  style={{
                    backgroundColor: "#f8fafc",
                    borderWidth: 1,
                    borderColor: "#e6e8ef",
                    borderRadius: 12,
                    padding: 12,
                    gap: 6,
                  }}
                >
                  <Text style={{ fontWeight: "700" }}>Cancel reason</Text>
                  <TextInput
                    value={cancelReason}
                    onChangeText={setCancelReason}
                    placeholder="handyman_unavailable"
                    style={{
                      borderWidth: 1,
                      borderColor: "#ddd",
                      borderRadius: 10,
                      padding: 10,
                    }}
                  />
                </View>
              </>
            ) : null}

            <View style={{ flexDirection: "row", gap: 10 }}>
              <TouchableOpacity
                onPress={() => setSelected(null)}
                style={{
                  flex: 1,
                  backgroundColor: "#e5e7eb",
                  padding: 12,
                  borderRadius: 12,
                  alignItems: "center",
                }}
              >
                <Text style={{ fontWeight: "700" }}>Close</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onCancel}
                disabled={cancelling}
                style={{
                  flex: 1,
                  backgroundColor: "#dc2626",
                  padding: 12,
                  borderRadius: 12,
                  alignItems: "center",
                }}
              >
                {cancelling ? <ActivityIndicator /> : <Text style={{ color: "#fff", fontWeight: "800" }}>Decline</Text>}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onConfirm}
                disabled={confirming}
                style={{
                  flex: 1,
                  backgroundColor: "#111827",
                  padding: 12,
                  borderRadius: 12,
                  alignItems: "center",
                }}
              >
                {confirming ? <ActivityIndicator /> : <Text style={{ color: "#fff", fontWeight: "800" }}>Confirm</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}