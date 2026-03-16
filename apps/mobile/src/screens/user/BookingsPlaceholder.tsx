import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  Text,
  View,
} from "react-native";
import {
  cancelBooking,
  completeBookingUser,
  createBookingReview,
  getMyBookings,
  type BookingResponse,
} from "@smart/api";
import { useAsyncOperation } from "../../hooks/useAsyncOperation";
import {
  BOOKING_STATUS_NORMALIZED,
  PAGINATION_DEFAULTS,
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

function canUserComplete(booking: BookingResponse) {
  const status = normalizeBookingStatus(booking.status);
  return status === BOOKING_STATUS_NORMALIZED.CONFIRMED && !booking.completed_by_user;
}

function canReviewBooking(booking: BookingResponse) {
  const status = normalizeBookingStatus(booking.status);
  return status === BOOKING_STATUS_NORMALIZED.COMPLETED || (!!booking.completed_by_user && !!booking.completed_by_handyman);
}

function StarRating({
  value,
  onChange,
  disabled,
  colors,
}: {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  colors: {
    text: string;
    textFaint: string;
    border: string;
    surfaceMuted: string;
    primary: string;
  };
}) {
  return (
    <View style={{ flexDirection: "row", gap: 8 }}>
      {[1, 2, 3, 4, 5].map((star) => {
        const active = star <= value;

        return (
          <Pressable
            key={star}
            onPress={() => {
              if (!disabled) onChange(star);
            }}
            disabled={disabled}
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: active ? colors.primary : colors.border,
              backgroundColor: active ? colors.surfaceMuted : "transparent",
              alignItems: "center",
              justifyContent: "center",
              opacity: disabled ? 0.6 : 1,
            }}
          >
            <Text
              style={{
                fontSize: 24,
                color: active ? colors.primary : colors.textFaint,
              }}
            >
              ★
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function BookingsPlaceholder() {
  const api = useMemo(() => createApiClient(), []);
  const { colors } = useTheme();

  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [selected, setSelected] = useState<BookingResponse | null>(null);
  const [cancelReason, setCancelReason] = useState("user_requested");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  const { execute: loadBookings, loading } = useAsyncOperation({
    onSuccess: () => {},
    alertTitle: "Load Bookings",
  });

  useEffect(() => {
    loadBookings(async () => {
      const data = await getMyBookings(api, { limit: PAGINATION_DEFAULTS.LIMIT_MEDIUM, offset: PAGINATION_DEFAULTS.OFFSET });
      setBookings(data);
    });
  }, []);

  const { execute: executeCancel, loading: cancelling } = useAsyncOperation({
    onSuccess: () => {
      setSelected(null);
      loadBookings(async () => {
        const data = await getMyBookings(api, { limit: PAGINATION_DEFAULTS.LIMIT_MEDIUM, offset: PAGINATION_DEFAULTS.OFFSET });
        setBookings(data);
      });
    },
    alertTitle: "Cancel Booking",
  });

  const onCancel = () => {
    if (!selected) return;

    executeCancel(async () => {
      const res = await cancelBooking(api, selected.booking_id, {
        reason: cancelReason || "user_requested",
      });
      Alert.alert("Booking cancelled", `Booking ${res.booking_id} is now ${res.status}.`);
    });
  };

  const { execute: executeComplete, loading: completing } = useAsyncOperation({
    onSuccess: () => {
      loadBookings(async () => {
        const data = await getMyBookings(api, { limit: PAGINATION_DEFAULTS.LIMIT_MEDIUM, offset: PAGINATION_DEFAULTS.OFFSET });
        setBookings(data);
      });
    },
    alertTitle: "Complete Booking",
  });

  const onComplete = () => {
    if (!selected) return;

    executeComplete(async () => {
      const res = await completeBookingUser(api, selected.booking_id);
      Alert.alert(
        "Completion recorded",
        `Booking ${res.booking_id} is now ${res.status}.`
      );
      setSelected((prev) =>
        prev
          ? {
              ...prev,
              status: res.status,
              completed_by_user: res.completed_by_user,
              completed_by_handyman: res.completed_by_handyman,
              completed_at: res.completed_at ?? prev.completed_at ?? null,
            }
          : prev
      );
    });
  };

  const { execute: executeSubmitReview, loading: submittingReview } = useAsyncOperation({
    onSuccess: () => {
      setSelected(null);
      setReviewRating(5);
      setReviewComment("");
      loadBookings(async () => {
        const data = await getMyBookings(api, { limit: 100, offset: 0 });
        setBookings(data);
      });
    },
    alertTitle: "Submit Review",
  });

  const onSubmitReview = () => {
    if (!selected) return;

    if (!canReviewBooking(selected)) {
      Alert.alert("Review not available", "This booking is not completed yet.");
      return;
    }

    executeSubmitReview(async () => {
      await createBookingReview(api, selected.booking_id, {
        rating: reviewRating,
        review_text: reviewComment.trim() || null,
      });

      Alert.alert("Review submitted", "Thanks for rating this handyman.");
    });
  };

  const grouped = {
    Pending: bookings.filter((b) => isPendingLikeBookingStatus(b.status)),
    Confirmed: bookings.filter((b) => normalizeBookingStatus(b.status) === BOOKING_STATUS_NORMALIZED.CONFIRMED),
    Completed: bookings.filter((b) => normalizeBookingStatus(b.status) === BOOKING_STATUS_NORMALIZED.COMPLETED),
    Cancelled: bookings.filter((b) => normalizeBookingStatus(b.status) === BOOKING_STATUS_NORMALIZED.CANCELLED),
    Failed: bookings.filter((b) => normalizeBookingStatus(b.status) === BOOKING_STATUS_NORMALIZED.FAILED),
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
          {item.job_description ? (
            <Text style={{ color: colors.textSoft }}>Description: {item.job_description}</Text>
          ) : null}
        </View>

        <AppButton
          label="Open details"
          onPress={() => {
            setCancelReason(item.cancellation_reason ?? "user_requested");
            setReviewRating(5);
            setReviewComment("");
            setSelected(item);
          }}
          tone="secondary"
        />
      </Card>
    );
  }

  const cancelDisabled =
    !selected ||
    [
      BOOKING_STATUS_NORMALIZED.CANCELLED,
      BOOKING_STATUS_NORMALIZED.FAILED,
      BOOKING_STATUS_NORMALIZED.COMPLETED,
    ].includes(normalizeBookingStatus(selected.status) as any);

  const completeDisabled = !selected || !canUserComplete(selected);
  const reviewDisabled = !selected || !canReviewBooking(selected);

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
                action={
                  <AppButton
                    label="Refresh"
                    onPress={() =>
                      loadBookings(async () => {
                        const data = await getMyBookings(api, { limit: PAGINATION_DEFAULTS.LIMIT_MEDIUM, offset: PAGINATION_DEFAULTS.OFFSET });
                        setBookings(data);
                      })
                    }
                    style={{ minWidth: 120 }}
                  />
                }
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

            {selected.job_description ? (
              <Text style={{ color: colors.textSoft }}>Description: {selected.job_description}</Text>
            ) : null}

            <Text style={{ color: colors.textSoft }}>
              Completed by you: {selected.completed_by_user ? "Yes" : "No"}
            </Text>
            <Text style={{ color: colors.textSoft }}>
              Completed by handyman: {selected.completed_by_handyman ? "Yes" : "No"}
            </Text>
            {selected.completed_at ? (
              <Text style={{ color: colors.textSoft }}>Completed at: {formatDateTime(selected.completed_at)}</Text>
            ) : null}

            {selected.cancellation_reason ? (
              <Text style={{ color: colors.textSoft }}>Cancel reason: {selected.cancellation_reason}</Text>
            ) : null}
            {selected.failure_reason ? (
              <Text style={{ color: colors.textSoft }}>Failure reason: {selected.failure_reason}</Text>
            ) : null}
            {selected.rejection_reason ? (
              <Text style={{ color: colors.textSoft }}>Rejection reason: {selected.rejection_reason}</Text>
            ) : null}

            {!reviewDisabled ? (
              <>
                <View style={{ gap: 8 }}>
                  <Text style={{ fontWeight: "700", color: colors.text }}>Review rating</Text>
                  <StarRating
                    value={reviewRating}
                    onChange={setReviewRating}
                    colors={{
                      text: colors.text,
                      textFaint: colors.textFaint,
                      border: colors.border,
                      surfaceMuted: colors.surfaceMuted,
                      primary: colors.primary,
                    }}
                  />
                  <Text style={{ color: colors.textSoft }}>{reviewRating} / 5</Text>
                </View>

                <View style={{ gap: 8 }}>
                  <Text style={{ fontWeight: "700", color: colors.text }}>Review comment</Text>
                  <AppInput
                    value={reviewComment}
                    onChangeText={setReviewComment}
                    placeholder="Tell others how it went..."
                  />
                </View>
              </>
            ) : null}

            {canUserComplete(selected) ? (
              <AppButton
                label="Mark as complete"
                onPress={onComplete}
                loading={completing}
              />
            ) : null}

            {normalizeBookingStatus(selected.status) !== BOOKING_STATUS_NORMALIZED.COMPLETED ? (
              <View style={{ gap: 8 }}>
                <Text style={{ fontWeight: "700", color: colors.text }}>Cancel reason</Text>
                <AppInput
                  value={cancelReason}
                  onChangeText={setCancelReason}
                  placeholder="user_requested"
                />
              </View>
            ) : null}

            <ButtonRow>
              <AppButton
                label="Close"
                onPress={() => setSelected(null)}
                tone="secondary"
                style={{ flex: 1 }}
              />
              {!reviewDisabled ? (
                <AppButton
                  label="Submit review"
                  onPress={onSubmitReview}
                  loading={submittingReview}
                  style={{ flex: 1 }}
                />
              ) : (
                <AppButton
                  label="Cancel booking"
                  onPress={onCancel}
                  tone="danger"
                  loading={cancelling}
                  disabled={cancelDisabled}
                  style={{ flex: 1 }}
                />
              )}
            </ButtonRow>
          </>
        ) : null}
      </BottomSheet>
    </>
  );
}