import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  SectionList,
  Pressable,
  Text,
  View,
} from 'react-native';
import {
  cancelBooking,
  completeBookingUser,
  createBookingReview,
  getMyBookings,
  type BookingResponse,
} from '@smart/api';
import { useAsyncOperation } from '../../hooks/useAsyncOperation';
import { useNotifications } from '../../notifications/NotificationsProvider';
import {
  BOOKING_STATUS_NORMALIZED,
  PAGINATION_DEFAULTS,
  getBookingDisplayStatus,
  getBookingStatusTone,
  normalizeBookingStatus,
} from '@smart/core';
import { createApiClient } from '../../lib/api';
import {
  canReviewBooking,
  canUserCompleteBooking,
  getUserBookingSections,
} from '../../lib/bookingSections';
import { formatDateTime } from '../../lib/dateTime';
import { APP_BACKGROUND_IMAGE } from '../../theme/appChrome';
import { useTheme } from '../../theme';
import {
  AppButton,
  AppInput,
  BottomSheet,
  ButtonRow,
  Card,
  EmptyState,
  Screen,
  StatusBadge,
} from '../../ui/primitives';
import { ScreenHeader } from '../../ui/ScreenHeader';

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
    <View style={{ flexDirection: 'row', gap: 8 }}>
      {[1, 2, 3, 4, 5].map(star => {
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
              backgroundColor: active ? colors.surfaceMuted : 'transparent',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: disabled ? 0.6 : 1,
            }}>
            <Text
              style={{
                fontSize: 24,
                color: active ? colors.primary : colors.textFaint,
              }}>
              ★
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function DetailRow({
  label,
  value,
  mono = false,
  colors,
}: {
  label: string;
  value: string;
  mono?: boolean;
  colors: {
    text: string;
    textSoft: string;
    textFaint: string;
  };
}) {
  return (
    <View style={{ gap: 3 }}>
      <Text
        style={{
          color: colors.textFaint,
          fontSize: 12,
          fontWeight: '700',
          letterSpacing: 0.3,
          textTransform: 'uppercase',
        }}>
        {label}
      </Text>
      <Text
        style={{
          color: colors.textSoft,
          fontSize: 16,
          lineHeight: 22,
          fontFamily: mono ? 'monospace' : undefined,
        }}>
        {value}
      </Text>
    </View>
  );
}

export default function BookingsPlaceholder() {
  const api = useMemo(() => createApiClient(), []);
  const { colors, mode } = useTheme();
  const { unreadCount } = useNotifications();

  const elevatedCardBackground =
    mode === 'dark' ? 'rgba(13, 26, 47, 0.92)' : 'rgba(247, 248, 250, 0.92)';
  const elevatedMutedBackground =
    mode === 'dark' ? 'rgba(18, 35, 61, 0.90)' : 'rgba(247, 248, 250, 0.88)';
  const sectionBadgeBackground =
    mode === 'dark' ? 'rgba(13, 26, 47, 0.88)' : 'rgba(247, 248, 250, 0.90)';

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

  function renderCard(item: BookingResponse) {
    return (
      <Card
        key={item.booking_id}
        style={{
          marginBottom: 12,
          backgroundColor: elevatedCardBackground,
          gap: 14,
        }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            gap: 12,
          }}>
          <View style={{ flex: 1 }}>
            <Text
              style={{ fontSize: 18, fontWeight: '800', color: colors.text }}>
              {item.handyman_email}
            </Text>
            <Text
              style={{
                marginTop: 4,
                color: colors.textFaint,
                fontFamily: 'monospace',
                fontSize: 13,
              }}>
              {item.booking_id}
            </Text>
          </View>

          <StatusBadge
            label={getBookingDisplayStatus(item.status, 'user')}
            tone={getBookingStatusTone(item.status)}
          />
        </View>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View
            style={{
              flex: 1,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.surfaceMuted,
              padding: 12,
              gap: 4,
            }}>
            <Text
              style={{
                color: colors.textFaint,
                fontSize: 12,
                fontWeight: '700',
                textTransform: 'uppercase',
              }}>
              Start
            </Text>
            <Text style={{ color: colors.textSoft, lineHeight: 20 }}>
              {formatDateTime(item.desired_start)}
            </Text>
          </View>

          <View
            style={{
              flex: 1,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.surfaceMuted,
              padding: 12,
              gap: 4,
            }}>
            <Text
              style={{
                color: colors.textFaint,
                fontSize: 12,
                fontWeight: '700',
                textTransform: 'uppercase',
              }}>
              End
            </Text>
            <Text style={{ color: colors.textSoft, lineHeight: 20 }}>
              {formatDateTime(item.desired_end)}
            </Text>
          </View>
        </View>

        {item.job_description ? (
          <View
            style={{
              borderRadius: 16,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.surface,
              padding: 12,
              gap: 4,
            }}>
            <Text
              style={{
                color: colors.textFaint,
                fontSize: 12,
                fontWeight: '700',
                textTransform: 'uppercase',
              }}>
              Job description
            </Text>
            <Text style={{ color: colors.textSoft, lineHeight: 22 }}>
              {item.job_description}
            </Text>
          </View>
        ) : null}

        <AppButton
          label="Open details"
          onPress={() => {
            setCancelReason(item.cancellation_reason ?? 'user_requested');
            setReviewRating(5);
            setReviewComment('');
            setSelected(item);
          }}
          tone="secondary"
          style={{ minHeight: 48 }}
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
          <Card style={{ backgroundColor: elevatedMutedBackground, gap: 10 }}>
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
                    backgroundColor: sectionBadgeBackground,
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
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: 12,
                }}>
                <View style={{ flex: 1, gap: 4 }}>
                  <Text
                    style={{ fontSize: 22, fontWeight: '800', color: colors.text }}>
                    {selected.handyman_email}
                  </Text>
                  <Text
                    style={{ color: colors.textFaint, fontFamily: 'monospace', fontSize: 13 }}>
                    {selected.booking_id}
                  </Text>
                </View>

                <StatusBadge
                  label={getBookingDisplayStatus(selected.status, 'user')}
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
              <View
                style={{
                  flex: 1,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: colors.border,
                  backgroundColor: colors.surface,
                  padding: 12,
                }}>
                <DetailRow
                  label="Start"
                  value={formatDateTime(selected.desired_start)}
                  colors={colors}
                />
              </View>
              <View
                style={{
                  flex: 1,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: colors.border,
                  backgroundColor: colors.surface,
                  padding: 12,
                }}>
                <DetailRow
                  label="End"
                  value={formatDateTime(selected.desired_end)}
                  colors={colors}
                />
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
              <DetailRow
                label="Completed by you"
                value={selected.completed_by_user ? 'Yes' : 'No'}
                colors={colors}
              />
              <DetailRow
                label="Completed by handyman"
                value={selected.completed_by_handyman ? 'Yes' : 'No'}
                colors={colors}
              />
              {selected.completed_at ? (
                <DetailRow
                  label="Completed at"
                  value={formatDateTime(selected.completed_at)}
                  colors={colors}
                />
              ) : null}
              {selected.cancellation_reason ? (
                <DetailRow
                  label="Cancel reason"
                  value={selected.cancellation_reason}
                  colors={colors}
                />
              ) : null}
              {selected.failure_reason ? (
                <DetailRow
                  label="Failure reason"
                  value={selected.failure_reason}
                  colors={colors}
                />
              ) : null}
              {selected.rejection_reason ? (
                <DetailRow
                  label="Rejection reason"
                  value={selected.rejection_reason}
                  colors={colors}
                />
              ) : null}
            </View>

            {!reviewDisabled ? (
              <View
                style={{
                  borderRadius: 18,
                  borderWidth: 1,
                  borderColor: colors.border,
                  backgroundColor: colors.surface,
                  padding: 14,
                  gap: 12,
                }}>
                <Text style={{ fontWeight: '800', color: colors.text, fontSize: 18 }}>
                  Review this booking
                </Text>

                <View style={{ gap: 8 }}>
                  <Text style={{ fontWeight: '700', color: colors.text }}>
                    Review rating
                  </Text>
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
                  <Text style={{ fontWeight: '700', color: colors.text }}>
                    Review comment
                  </Text>
                  <AppInput
                    value={reviewComment}
                    onChangeText={setReviewComment}
                    placeholder="Tell others how it went..."
                  />
                </View>
              </View>
            ) : null}

            {canUserCompleteBooking(selected) ? (
              <AppButton
                label="Mark as complete"
                onPress={onComplete}
                loading={completing}
              />
            ) : null}

            {normalizeBookingStatus(selected.status) !==
            BOOKING_STATUS_NORMALIZED.COMPLETED ? (
              <View
                style={{
                  borderRadius: 18,
                  borderWidth: 1,
                  borderColor: colors.border,
                  backgroundColor: colors.surface,
                  padding: 14,
                  gap: 8,
                }}>
                <Text style={{ fontWeight: '700', color: colors.text }}>
                  Cancel reason
                </Text>
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
          </ScrollView>
        ) : null}
      </BottomSheet>
    </>
  );
}
