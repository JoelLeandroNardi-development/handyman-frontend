import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Text,
  View,
} from "react-native";
import {
  cancelBooking,
  confirmBooking,
  getMyJobs,
  type BookingResponse,
} from "@smart/api";
import {
  getBookingDisplayStatus,
  getBookingStatusTone,
  isIncomingLikeBookingStatus,
  normalizeBookingStatus,
} from "@smart/core";
import { createApiClient } from "../../lib/api";
import { formatDateTime } from "../../lib/dateTime";
import { useSession } from "../../auth/SessionProvider";
import {
  AppButton,
  AppInput,
  BottomSheet,
  ButtonRow,
  Card,
  CardTitle,
  EmptyState,
  PageHeader,
  Screen,
  StatusBadge,
} from "../../ui/primitives";
import { useTheme } from "../../theme";

export default function JobsScreen() {
  const api = useMemo(() => createApiClient(), []);
  const { session } = useSession();
  const { colors } = useTheme();

  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [selected, setSelected] = useState<BookingResponse | null>(null);
  const [cancelReason, setCancelReason] = useState("handyman_unavailable");
  const [confirming, setConfirming] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  async function loadBookings() {
    setLoading(true);
    try {
      const data = await getMyJobs(api, { limit: 100, offset: 0 });
      setBookings(data);
    } catch (e) {
      Alert.alert("Could not load jobs", (e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadBookings();
  }, [session?.email]);

  const incoming = bookings.filter((b) => isIncomingLikeBookingStatus(b.status));
  const active = bookings.filter((b) => normalizeBookingStatus(b.status) === "confirmed");
  const other = bookings.filter((b) => {
    const s = normalizeBookingStatus(b.status);
    return s !== "pending" && s !== "reserved" && s !== "confirmed";
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
    return (
      <Card key={item.booking_id} style={{ marginBottom: 10 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: "800", color: colors.text }}>{item.user_email}</Text>
            <Text
              style={{
                marginTop: 4,
                color: colors.textFaint,
                fontFamily: "monospace",
                fontSize: 13,
              }}
            >
              {item.booking_id}
            </Text>
          </View>

          <StatusBadge
            label={getBookingDisplayStatus(item.status, "handyman")}
            tone={getBookingStatusTone(item.status)}
          />
        </View>

        <View style={{ gap: 4 }}>
          <Text style={{ color: colors.textSoft }}>Start: {formatDateTime(item.desired_start)}</Text>
          <Text style={{ color: colors.textSoft }}>End: {formatDateTime(item.desired_end)}</Text>
        </View>

        <AppButton
          label="Open actions"
          onPress={() => {
            setCancelReason(item.cancellation_reason ?? "handyman_unavailable");
            setSelected(item);
          }}
          tone="secondary"
        />
      </Card>
    );
  }

  return (
    <>
      <Screen>
        <FlatList
          contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
          data={[
            { section: "Incoming requests", items: incoming },
            { section: "Active jobs", items: active },
            { section: "Other", items: other },
          ]}
          keyExtractor={(item) => item.section}
          ListHeaderComponent={
            <View style={{ gap: 12, marginBottom: 14 }}>
              <PageHeader
                title="Jobs"
                subtitle="Incoming and active bookings"
                action={<AppButton label="Refresh" onPress={loadBookings} style={{ minWidth: 120 }} />}
              />

              <Card>
                <CardTitle title="Logged in as" />
                <Text style={{ color: colors.textSoft, fontSize: 16 }}>{session?.email ?? "-"}</Text>
              </Card>
            </View>
          }
          renderItem={({ item }) => (
            <View style={{ marginBottom: 18 }}>
              <Text style={{ fontSize: 18, fontWeight: "800", color: colors.text, marginBottom: 10 }}>
                {item.section}
              </Text>

              {item.items.length === 0 ? (
                <EmptyState text="No bookings in this section." />
              ) : (
                item.items.map(renderBookingCard)
              )}
            </View>
          )}
          ListEmptyComponent={
            loading ? (
              <View style={{ paddingVertical: 40, alignItems: "center" }}>
                <ActivityIndicator color={colors.primary} />
              </View>
            ) : null
          }
        />
      </Screen>

      <BottomSheet visible={!!selected} onClose={() => setSelected(null)} title="Job actions">
        {selected ? (
          <>
            <Text style={{ color: colors.textSoft }}>User: {selected.user_email}</Text>
            <Text style={{ color: colors.textSoft }}>Booking ID: {selected.booking_id}</Text>
            <Text style={{ color: colors.textSoft }}>Start: {formatDateTime(selected.desired_start)}</Text>
            <Text style={{ color: colors.textSoft }}>End: {formatDateTime(selected.desired_end)}</Text>
            <Text style={{ color: colors.textSoft }}>
              Status: {getBookingDisplayStatus(selected.status, "handyman")}
            </Text>

            <View style={{ gap: 8 }}>
              <Text style={{ fontWeight: "700", color: colors.text }}>Cancel reason</Text>
              <AppInput
                value={cancelReason}
                onChangeText={setCancelReason}
                placeholder="handyman_unavailable"
              />
            </View>

            <ButtonRow>
              <AppButton
                label="Close"
                onPress={() => setSelected(null)}
                tone="secondary"
                style={{ flex: 1 }}
              />
              <AppButton
                label="Decline"
                onPress={onCancel}
                tone="danger"
                loading={cancelling}
                style={{ flex: 1 }}
              />
              <AppButton
                label="Confirm"
                onPress={onConfirm}
                loading={confirming}
                style={{ flex: 1 }}
              />
            </ButtonRow>
          </>
        ) : null}
      </BottomSheet>
    </>
  );
}