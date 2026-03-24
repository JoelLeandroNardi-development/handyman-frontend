import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  SectionList,
  Text,
  View,
} from "react-native";
import { APP_BACKGROUND_IMAGE } from '../../theme/appChrome';
import {
  completeBookingHandyman,
  confirmBooking,
  getBooking,
  getMyJobs,
  rejectBookingCompletion,
  type BookingResponse,
} from "@smart/api";
import { useNavigation, useRoute } from '@react-navigation/native';
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
  DetailRow,
  EmptyState,
  Screen,
  StatusBadge,
} from "../../ui/primitives";
import { ScreenHeader } from '../../ui/ScreenHeader';
import { useNotifications } from '../../notifications/NotificationsProvider';
import { useTheme } from "../../theme";

export default function JobsScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
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

  const openJobDetails = useCallback((booking: BookingResponse) => {
    setRejectReason(booking.rejection_reason ?? 'Job rejected after inspection');
    setSelected(booking);
  }, []);

  const focusBookingId = route.params?.focusBookingId;
  const focusNonce = route.params?.focusNonce;

  useEffect(() => {
    if (typeof focusBookingId !== 'string' || focusBookingId.length === 0) {
      return;
    }

    const clearFocusParams = () => {
      navigation.setParams({
        focusBookingId: undefined,
        focusNonce: undefined,
      });
    };

    const existing = bookings.find(item => item.booking_id === focusBookingId);
    if (existing) {
      openJobDetails(existing);
      clearFocusParams();
      return;
    }

    let cancelled = false;

    const loadById = async () => {
      try {
        const fetched = await getBooking(api, focusBookingId);
        if (cancelled) return;

        setBookings(prev => {
          if (prev.some(item => item.booking_id === fetched.booking_id)) {
            return prev;
          }
          return [fetched, ...prev];
        });
        openJobDetails(fetched);
      } catch {
      } finally {
        if (!cancelled) {
          clearFocusParams();
        }
      }
    };

    void loadById();

    return () => {
      cancelled = true;
    };
  }, [
    api,
    bookings,
    focusBookingId,
    focusNonce,
    navigation,
    openJobDetails,
  ]);

  function renderBookingCard(item: BookingResponse) {
    return (
      <Card key={item.booking_id} style={{ marginBottom: 12, backgroundColor: colors.surfaceElevated, gap: 14 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 18, fontWeight: "800", color: colors.text }}>{item.user_email}</Text>
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

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1, borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceMuted, padding: 12, gap: 4 }}>
            <Text style={{ color: colors.textFaint, fontSize: 12, fontWeight: '700', textTransform: 'uppercase' }}>Start</Text>
            <Text style={{ color: colors.textSoft, lineHeight: 20 }}>{formatDateTime(item.desired_start)}</Text>
          </View>
          <View style={{ flex: 1, borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceMuted, padding: 12, gap: 4 }}>
            <Text style={{ color: colors.textFaint, fontSize: 12, fontWeight: '700', textTransform: 'uppercase' }}>End</Text>
            <Text style={{ color: colors.textSoft, lineHeight: 20 }}>{formatDateTime(item.desired_end)}</Text>
          </View>
        </View>

        {item.job_description ? (
          <View style={{ borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, padding: 12, gap: 4 }}>
            <Text style={{ color: colors.textFaint, fontSize: 12, fontWeight: '700', textTransform: 'uppercase' }}>Job description</Text>
            <Text style={{ color: colors.textSoft, lineHeight: 22 }}>{item.job_description}</Text>
          </View>
        ) : null}

        {item.rejected_by_handyman ? (
          <View style={{ borderRadius: 16, borderWidth: 1, borderColor: colors.danger, backgroundColor: colors.dangerSoft, padding: 12, gap: 4 }}>
            <Text style={{ color: colors.danger, fontSize: 12, fontWeight: '700', textTransform: 'uppercase' }}>Rejected</Text>
            <Text style={{ color: colors.danger, lineHeight: 22 }}>{item.rejection_reason || "No reason given"}</Text>
          </View>
        ) : null}

        <AppButton
          label="Open actions"
          onPress={() => {
            openJobDetails(item);
          }}
          tone="secondary"
          style={{ minHeight: 48 }}
        />
      </Card>
    );
  }

  return (
    <>
      <Screen backgroundImage={APP_BACKGROUND_IMAGE}>
        <ScreenHeader
          title="Jobs"
          subtitle="Incoming, active, completed, and rejected jobs"
          notificationBadgeCount={unreadCount}
        />

        <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 }}>
          <Card style={{ backgroundColor: colors.surfaceElevatedMuted, gap: 10 }}>
            <Text style={{ color: colors.textSoft, lineHeight: 22 }}>
              Track incoming requests, manage active jobs, and mark work as complete.
            </Text>
            <AppButton
              label="Refresh jobs"
              onPress={() => loadBookings(fetchJobs)}
              style={{ alignSelf: 'flex-start', minWidth: 168, minHeight: 48 }}
            />
          </Card>
        </View>

        <SectionList
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 28 }}
          sections={sections}
          stickySectionHeadersEnabled
          keyExtractor={(item) => item.booking_id}
          renderSectionHeader={({ section }) => (
            <View
              style={{
                paddingTop: 10,
                paddingBottom: 10,
                backgroundColor: 'transparent',
              }}
            >
              <View
                style={{
                  alignSelf: 'flex-start',
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: colors.border,
                  backgroundColor: colors.sectionBadge,
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                }}>
                <Text style={{ fontSize: 16, fontWeight: '800', color: colors.text }}>
                  {section.title}
                </Text>
              </View>
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
          <ScrollView
            style={{ maxHeight: 540 }}
            contentContainerStyle={{ gap: 14, paddingBottom: 8 }}
            showsVerticalScrollIndicator={false}>
            <View
              style={{
                borderRadius: 18,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.surfaceMuted,
                padding: 14,
                gap: 12,
              }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                <View style={{ flex: 1, gap: 4 }}>
                  <Text style={{ fontSize: 22, fontWeight: '800', color: colors.text }}>
                    {selected.user_email}
                  </Text>
                  <Text style={{ color: colors.textFaint, fontFamily: 'monospace', fontSize: 13 }}>
                    {selected.booking_id}
                  </Text>
                </View>
                <StatusBadge
                  label={getBookingDisplayStatus(selected.status, "handyman")}
                  tone={getBookingStatusTone(selected.status)}
                />
              </View>

              {selected.job_description ? (
                <Text style={{ color: colors.textSoft, lineHeight: 22 }}>
                  {selected.job_description}
                </Text>
              ) : null}
            </View>

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1, borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, padding: 12 }}>
                <DetailRow label="Start" value={formatDateTime(selected.desired_start)} />
              </View>
              <View style={{ flex: 1, borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, padding: 12 }}>
                <DetailRow label="End" value={formatDateTime(selected.desired_end)} />
              </View>
            </View>

            <View
              style={{
                borderRadius: 18,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.surface,
                padding: 14,
                gap: 12,
              }}>
              <DetailRow label="Completed by user" value={selected.completed_by_user ? "Yes" : "No"} />
              <DetailRow label="Completed by handyman" value={selected.completed_by_handyman ? "Yes" : "No"} />
              {selected.completed_at ? (
                <DetailRow label="Completed at" value={formatDateTime(selected.completed_at)} />
              ) : null}
              {selected.rejection_reason ? (
                <DetailRow label="Rejection reason" value={selected.rejection_reason} />
              ) : null}
            </View>

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
          </ScrollView>
        ) : null}
      </BottomSheet>
    </>
  );
}