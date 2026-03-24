import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SectionList,
  Text,
  View,
} from 'react-native';
import {
  cancelBooking,
  completeBookingUser,
  createBookingReview,
  getBooking,
  getMyBookings,
  type BookingResponse,
} from '@smart/api';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAsyncOperation } from '../../hooks/useAsyncOperation';
import { useNotifications } from '../../notifications/NotificationsProvider';
import {
  BOOKING_STATUS_NORMALIZED,
  PAGINATION_DEFAULTS,
  normalizeBookingStatus,
} from '@smart/core';
import { createApiClient } from '../../lib/api';
import {
  canReviewBooking,
  canUserCompleteBooking,
  getUserBookingSections,
} from '../../lib/bookingSections';
import { APP_BACKGROUND_IMAGE } from '../../theme/appChrome';
import { useTheme } from '../../theme';
import {
  AppButton,
  BottomSheet,
  Card,
  EmptyState,
  Screen,
} from '../../ui/primitives';

import { ScreenHeader } from '../../ui/ScreenHeader';
import { BookingCard } from './BookingCard';
import { BookingDetailsSheet } from './BookingDetailsSheet';

export default function BookingsPlaceholder() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const api = useMemo(() => createApiClient(), []);
  const { colors } = useTheme();
  const { unreadCount } = useNotifications();

  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [selected, setSelected] = useState<BookingResponse | null>(null);
  const [cancelReason, setCancelReason] = useState('user_requested');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  const fetchBookings = useCallback(async () => {
    const data = await getMyBookings(api, {
      limit: PAGINATION_DEFAULTS.LIMIT_MEDIUM,
      offset: PAGINATION_DEFAULTS.OFFSET,
    });
    setBookings(data);
  }, [api]);

  const { execute: loadBookings, loading } = useAsyncOperation({
    alertTitle: 'Load Bookings',
  });

  useEffect(() => {
    loadBookings(fetchBookings);
  }, [fetchBookings, loadBookings]);

  const { execute: executeCancel, loading: cancelling } = useAsyncOperation({
    onSuccess: () => {
      setSelected(null);
      loadBookings(fetchBookings);
    },
    alertTitle: 'Cancel Booking',
  });

  const onCancel = () => {
    if (!selected) return;

    executeCancel(async () => {
      const res = await cancelBooking(api, selected.booking_id, {
        reason: cancelReason || 'user_requested',
      });
      Alert.alert(
        'Booking cancelled',
        `Booking ${res.booking_id} is now ${res.status}.`,
      );
    });
  };

  const { execute: executeComplete, loading: completing } = useAsyncOperation({
    onSuccess: () => {
      loadBookings(fetchBookings);
    },
    alertTitle: 'Complete Booking',
  });

  const onComplete = () => {
    if (!selected) return;

    executeComplete(async () => {
      const res = await completeBookingUser(api, selected.booking_id);
      Alert.alert(
        'Completion recorded',
        `Booking ${res.booking_id} is now ${res.status}.`,
      );
      setSelected(prev =>
        prev
          ? {
              ...prev,
              status: res.status,
              completed_by_user: res.completed_by_user,
              completed_by_handyman: res.completed_by_handyman,
              completed_at: res.completed_at ?? prev.completed_at ?? null,
            }
          : prev,
      );
    });
  };

  const { execute: executeSubmitReview, loading: submittingReview } =
    useAsyncOperation({
      onSuccess: () => {
        setSelected(null);
        setReviewRating(5);
        setReviewComment('');
        loadBookings(fetchBookings);
      },
      alertTitle: 'Submit Review',
    });

  const onSubmitReview = () => {
    if (!selected) return;

    if (!canReviewBooking(selected)) {
      Alert.alert('Review not available', 'This booking is not completed yet.');
      return;
    }

    executeSubmitReview(async () => {
      await createBookingReview(api, selected.booking_id, {
        rating: reviewRating,
        review_text: reviewComment.trim() || null,
      });

      Alert.alert('Review submitted', 'Thanks for rating this handyman.');
    });
  };

  const sections = getUserBookingSections(bookings);

  const openBookingDetails = useCallback((booking: BookingResponse) => {
    setCancelReason(booking.cancellation_reason ?? 'user_requested');
    setReviewRating(5);
    setReviewComment('');
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
      openBookingDetails(existing);
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
        openBookingDetails(fetched);
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
    openBookingDetails,
  ]);

  function renderCard(item: BookingResponse) {
    return (
      <BookingCard
        key={item.booking_id}
        item={item}
        onPress={() => openBookingDetails(item)}
      />
    );
  }

  const cancelDisabled =
    !selected ||
    [
      BOOKING_STATUS_NORMALIZED.CANCELLED,
      BOOKING_STATUS_NORMALIZED.FAILED,
      BOOKING_STATUS_NORMALIZED.COMPLETED,
    ].includes(normalizeBookingStatus(selected.status) as any);

  const completeDisabled = !selected || !canUserCompleteBooking(selected);
  const reviewDisabled = !selected || !canReviewBooking(selected);

  return (
    <>
      <Screen backgroundImage={APP_BACKGROUND_IMAGE}>
        <ScreenHeader
          title="Bookings"
          subtitle="Your booking requests and status"
          notificationBadgeCount={unreadCount}
        />

        <View
          style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 }}>
          <Card style={{ backgroundColor: colors.surfaceElevatedMuted, gap: 10 }}>
            <Text style={{ color: colors.textSoft, lineHeight: 22 }}>
              Keep track of each request, open the full details, and leave a review once the work is complete.
            </Text>
            <AppButton
              label="Refresh bookings"
              onPress={() => loadBookings(fetchBookings)}
              style={{ alignSelf: 'flex-start', minWidth: 168, minHeight: 48 }}
            />
          </Card>
        </View>

        <SectionList
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 28 }}
          sections={sections}
          stickySectionHeadersEnabled
          keyExtractor={item => item.booking_id}
          renderSectionHeader={({ section }) => (
            <View
              style={{
                paddingTop: 10,
                paddingBottom: 10,
                backgroundColor: 'transparent',
              }}>
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
                <Text
                  style={{ fontSize: 16, fontWeight: '800', color: colors.text }}>
                  {section.title}
                </Text>
              </View>
            </View>
          )}
          renderItem={({ item }) => renderCard(item)}
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
              <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                <ActivityIndicator color={colors.primary} />
              </View>
            ) : null
          }
        />
      </Screen>

      <BottomSheet
        visible={!!selected}
        onClose={() => setSelected(null)}
        title="Booking details">
        {selected ? (
          <BookingDetailsSheet
            selected={selected}
            cancelReason={cancelReason}
            setCancelReason={setCancelReason}
            reviewRating={reviewRating}
            setReviewRating={setReviewRating}
            reviewComment={reviewComment}
            setReviewComment={setReviewComment}
            onClose={() => setSelected(null)}
            onComplete={onComplete}
            completing={completing}
            onCancel={onCancel}
            cancelling={cancelling}
            cancelDisabled={cancelDisabled}
            onSubmitReview={onSubmitReview}
            submittingReview={submittingReview}
            reviewDisabled={reviewDisabled}
          />
        ) : null}
      </BottomSheet>
    </>
  );
}
