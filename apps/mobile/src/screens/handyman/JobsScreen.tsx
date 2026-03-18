import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SectionList,
  Text,
  View,
} from "react-native";
import {
  completeBookingHandyman,
  confirmBooking,
  getMyJobs,
  rejectBookingCompletion,
  type BookingResponse,
} from "@smart/api";
import { useAsyncOperation } from "../../hooks/useAsyncOperation";
import {
  BOOKING_STATUS_NORMALIZED,
  PAGINATION_DEFAULTS,
  getBookingDisplayStatus,
  getBookingStatusTone,
  isIncomingLikeBookingStatus,
} from "@smart/core";
import { createApiClient } from "../../lib/api";
import {
  canCompleteJob,
  canRejectJob,
  getHandymanJobSections,
} from '../../lib/bookingSections';
import { formatDateTime } from "../../lib/dateTime";
import { useSession } from "../../auth/SessionProvider";
import {
  AppButton,
  AppInput,
  BottomSheet,
  ButtonRow,
  Card,
  EmptyState,
  Screen,
  StatusBadge,
} from "../../ui/primitives";
import { ScreenHeader } from '../../ui/ScreenHeader';
import { useNotifications } from '../../notifications/NotificationsProvider';
import { useTheme } from "../../theme";

export default function JobsScreen() {
  const api = useMemo(() => createApiClient(), []);
  const { session } = useSession();
  const { colors } = useTheme();
  const { unreadCount } = useNotifications();

  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [selected, setSelected] = useState<BookingResponse | null>(null);
  const [rejectReason, setRejectReason] = useState("Job rejected after inspection");

  const fetchJobs = useCallback(async () => {
    const data = await getMyJobs(api, {
      limit: PAGINATION_DEFAULTS.LIMIT_MEDIUM,
      offset: PAGINATION_DEFAULTS.OFFSET,
    });
    setBookings(data);
  }, [api]);

  const { execute: loadBookings, loading } = useAsyncOperation({
    alertTitle: "Load Jobs",
  });

  useEffect(() => {
    loadBookings(fetchJobs);
  }, [fetchJobs, loadBookings, session?.email]);

  const { execute: executeConfirm, loading: confirming } = useAsyncOperation({
    onSuccess: () => {
      setSelected(null);
      loadBookings(fetchJobs);
    },
    alertTitle: "Confirm Booking",
  });

  const onConfirm = () => {
    if (!selected) return;

    executeConfirm(async () => {
      const res = await confirmBooking(api, selected.booking_id);
      Alert.alert("Booking confirmed", `Booking ${res.booking_id} is now ${res.status}.`);
    });
  };

  const { execute: executeReject, loading: rejecting } = useAsyncOperation({
    onSuccess: () => {
      setSelected(null);
      loadBookings(fetchJobs);
    },
    alertTitle: "Reject Job",
  });

  const onReject = () => {
    if (!selected) return;
    if (!rejectReason.trim()) {
      Alert.alert("Reason required", "Please add a reason.");
      return;
    }

    executeReject(async () => {
      const res = await rejectBookingCompletion(api, selected.booking_id, {
        reason: rejectReason.trim(),
      });
      Alert.alert("Job rejected", `Booking ${res.booking_id} is now ${res.status}.`);
    });
  };

  const { execute: executeComplete, loading: completing } = useAsyncOperation({
    onSuccess: () => {
      loadBookings(fetchJobs);
    },
    alertTitle: "Complete Job",
  });

  const onComplete = () => {
    if (!selected) return;

    executeComplete(async () => {
      const res = await completeBookingHandyman(api, selected.booking_id);
      Alert.alert("Completion updated", `Booking ${res.booking_id} is now ${res.status}.`);
      setSelected((prev) =>
        prev
          ? {
              ...prev,
              status: res.status,
              completed_by_user: res.completed_by_user,
              completed_by_handyman: res.completed_by_handyman,
              completed_at: res.completed_at ?? null,
            }
          : null
      );
    });
  };

  const sections = getHandymanJobSections(bookings);

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
          {item.job_description ? (
            <Text style={{ color: colors.textSoft }}>Job: {item.job_description}</Text>
          ) : null}
          <Text style={{ color: colors.textSoft }}>
            Completion: user={item.completed_by_user ? "yes" : "no"} • handyman={item.completed_by_handyman ? "yes" : "no"}
          </Text>
          {item.completed_at ? (
            <Text style={{ color: colors.textSoft }}>Completed at: {formatDateTime(item.completed_at)}</Text>
          ) : null}
          {item.rejected_by_handyman ? (
            <Text style={{ color: colors.danger }}>
              Rejected{item.rejection_reason ? `: ${item.rejection_reason}` : ""}
            </Text>
          ) : null}
        </View>

        <AppButton
          label="Open actions"
          onPress={() => {
            setRejectReason(item.rejection_reason ?? "Job rejected after inspection");
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
        <ScreenHeader
          title="Jobs"
          subtitle="Incoming, active, completed, and rejected jobs"
          notificationBadgeCount={unreadCount}
        />

        <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 2 }}>
          <AppButton
            label="Refresh"
            onPress={() => loadBookings(fetchJobs)}
            style={{ minWidth: 120 }}
          />
        </View>

        <SectionList
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
          sections={sections}
          stickySectionHeadersEnabled
          keyExtractor={(item) => item.booking_id}
          renderSectionHeader={({ section }) => (
            <View
              style={{
                paddingTop: 6,
                paddingBottom: 8,
                backgroundColor: colors.bg,
              }}
            >
              <Text style={{ fontSize: 18, fontWeight: "800", color: colors.text }}>
                {section.title}
              </Text>
            </View>
          )}
          renderItem={({ item }) => renderBookingCard(item)}
          renderSectionFooter={({ section }) =>
            section.data.length === 0 ? (
              <View style={{ marginBottom: 12 }}>
                <EmptyState text="No bookings in this section." />
              </View>
            ) : (
              <View style={{ height: 8 }} />
            )
          }
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

            {selected.job_description ? (
              <Text style={{ color: colors.textSoft }}>Job: {selected.job_description}</Text>
            ) : null}

            <Text style={{ color: colors.textSoft }}>
              Completed by user: {selected.completed_by_user ? "Yes" : "No"}
            </Text>
            <Text style={{ color: colors.textSoft }}>
              Completed by handyman: {selected.completed_by_handyman ? "Yes" : "No"}
            </Text>

            {selected.completed_at ? (
              <Text style={{ color: colors.textSoft }}>
                Completed at: {formatDateTime(selected.completed_at)}
              </Text>
            ) : null}

            {canRejectJob(selected) ? (
              <View style={{ gap: 8 }}>
                <Text style={{ fontWeight: "700", color: colors.text }}>Reject reason</Text>
                <AppInput
                  value={rejectReason}
                  onChangeText={setRejectReason}
                  placeholder="Why are you rejecting this job?"
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

              {isIncomingLikeBookingStatus(selected.status) ? (
                <AppButton
                  label="Confirm"
                  onPress={onConfirm}
                  loading={confirming}
                  style={{ flex: 1 }}
                />
              ) : null}

              {canCompleteJob(selected) ? (
                <AppButton
                  label="Mark complete"
                  onPress={onComplete}
                  loading={completing}
                  style={{ flex: 1 }}
                />
              ) : null}

              {canRejectJob(selected) ? (
                <AppButton
                  label="Reject job"
                  onPress={onReject}
                  tone="danger"
                  loading={rejecting}
                  style={{ flex: 1 }}
                />
              ) : null}
            </ButtonRow>
          </>
        ) : null}
      </BottomSheet>
    </>
  );
}