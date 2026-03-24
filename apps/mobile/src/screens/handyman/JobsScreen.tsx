import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
  PAGINATION_DEFAULTS,
} from "@smart/core";
import { createApiClient } from "../../lib/api";
import {
  getHandymanJobSections,
} from '../../lib/bookingSections';
import { useSession } from "../../auth/SessionProvider";
import {
  AppButton,
  BottomSheet,
  Card,
  EmptyState,
  Screen,
} from "../../ui/primitives";
import { ScreenHeader } from '../../ui/ScreenHeader';
import { useNotifications } from '../../notifications/NotificationsProvider';
import { useTheme } from "../../theme";
import { JobCard } from './JobCard';
import { JobDetailsSheet } from './JobDetailsSheet';

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
      <JobCard
        key={item.booking_id}
        item={item}
        onPress={() => openJobDetails(item)}
      />
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
          <JobDetailsSheet
            selected={selected}
            rejectReason={rejectReason}
            setRejectReason={setRejectReason}
            onClose={() => setSelected(null)}
            onConfirm={onConfirm}
            confirming={confirming}
            onComplete={onComplete}
            completing={completing}
            onReject={onReject}
            rejecting={rejecting}
          />
        ) : null}
      </BottomSheet>
    </>
  );
}