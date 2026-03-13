import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Text,
  View,
} from "react-native";
import { cancelBooking, getMyBookings, type BookingResponse } from "@smart/api";
import {
  getBookingDisplayStatus,
  getBookingStatusTone,
  isPendingLikeBookingStatus,
  normalizeBookingStatus,
} from "@smart/core";
import { createApiClient } from "../../lib/api";
import { formatDateTime } from "../../lib/dateTime";
import { useTheme } from "../../theme";
import {
  AppButton,
  AppInput,
  BottomSheet,
  ButtonRow,
  Card,
  EmptyState,
  PageHeader,
  Screen,
  StatusBadge,
} from "../../ui/primitives";

export default function BookingsPlaceholder() {
  const api = useMemo(() => createApiClient(), []);
  const { colors } = useTheme();

  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [selected, setSelected] = useState<BookingResponse | null>(null);
  const [cancelReason, setCancelReason] = useState("user_requested");
  const [cancelling, setCancelling] = useState(false);

  async function loadBookings() {
    setLoading(true);
    try {
      const data = await getMyBookings(api, { limit: 100, offset: 0 });
      setBookings(data);
    } catch (e) {
      Alert.alert("Could not load bookings", (e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadBookings();
  }, []);

  async function onCancel() {
    if (!selected) return;

    setCancelling(true);
    try {
      const res = await cancelBooking(api, selected.booking_id, {
        reason: cancelReason || "user_requested",
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

  const grouped = {
    Pending: bookings.filter((b) => isPendingLikeBookingStatus(b.status)),
    Confirmed: bookings.filter((b) => normalizeBookingStatus(b.status) === "confirmed"),
    Cancelled: bookings.filter((b) => normalizeBookingStatus(b.status) === "cancelled"),
    Failed: bookings.filter((b) => normalizeBookingStatus(b.status) === "failed"),
  };

  function renderCard(item: BookingResponse) {
    return (
      <Card key={item.booking_id} style={{ marginBottom: 10 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: "800", color: colors.text }}>
              {item.handyman_email}
            </Text>
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
            label={getBookingDisplayStatus(item.status, "user")}
            tone={getBookingStatusTone(item.status)}
          />
        </View>

        <View style={{ gap: 4 }}>
          <Text style={{ color: colors.textSoft }}>Start: {formatDateTime(item.desired_start)}</Text>
          <Text style={{ color: colors.textSoft }}>End: {formatDateTime(item.desired_end)}</Text>
        </View>

        <AppButton
          label="Open details"
          onPress={() => {
            setCancelReason(item.cancellation_reason ?? "user_requested");
            setSelected(item);
          }}
          tone="secondary"
        />
      </Card>
    );
  }

  const cancelDisabled =
    !selected || ["cancelled", "failed"].includes(normalizeBookingStatus(selected.status));

  return (
    <>
      <Screen>
        <FlatList
          contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
          data={Object.entries(grouped)}
          keyExtractor={([section]) => section}
          ListHeaderComponent={
            <View style={{ marginBottom: 14 }}>
              <PageHeader
                title="Bookings"
                subtitle="Your booking requests and status"
                action={<AppButton label="Refresh" onPress={loadBookings} style={{ minWidth: 120 }} />}
              />
            </View>
          }
          renderItem={({ item: [section, items] }) => (
            <View style={{ marginBottom: 18 }}>
              <Text style={{ fontSize: 18, fontWeight: "800", color: colors.text, marginBottom: 10 }}>
                {section}
              </Text>

              {items.length === 0 ? (
                <EmptyState text="No bookings in this section." />
              ) : (
                items.map(renderCard)
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

      <BottomSheet visible={!!selected} onClose={() => setSelected(null)} title="Booking details">
        {selected ? (
          <>
            <Text style={{ color: colors.textSoft }}>Handyman: {selected.handyman_email}</Text>
            <Text style={{ color: colors.textSoft }}>Booking ID: {selected.booking_id}</Text>
            <Text style={{ color: colors.textSoft }}>Start: {formatDateTime(selected.desired_start)}</Text>
            <Text style={{ color: colors.textSoft }}>End: {formatDateTime(selected.desired_end)}</Text>
            <Text style={{ color: colors.textSoft }}>
              Status: {getBookingDisplayStatus(selected.status, "user")}
            </Text>
            {selected.cancellation_reason ? (
              <Text style={{ color: colors.textSoft }}>Cancel reason: {selected.cancellation_reason}</Text>
            ) : null}
            {selected.failure_reason ? (
              <Text style={{ color: colors.textSoft }}>Failure reason: {selected.failure_reason}</Text>
            ) : null}

            <View style={{ gap: 8 }}>
              <Text style={{ fontWeight: "700", color: colors.text }}>Cancel reason</Text>
              <AppInput
                value={cancelReason}
                onChangeText={setCancelReason}
                placeholder="user_requested"
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
                label="Cancel booking"
                onPress={onCancel}
                tone="danger"
                loading={cancelling}
                disabled={cancelDisabled}
                style={{ flex: 1 }}
              />
            </ButtonRow>
          </>
        ) : null}
      </BottomSheet>
    </>
  );
}