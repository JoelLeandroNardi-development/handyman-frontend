import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { type BookingResponse } from '@smart/api';
import {
  BOOKING_STATUS_NORMALIZED,
  getBookingDisplayStatus,
  getBookingStatusTone,
  normalizeBookingStatus,
} from '@smart/core';
import { canReviewBooking, canUserCompleteBooking } from '../../lib/bookingSections';
import { formatDateTime } from '../../lib/dateTime';
import { useTheme } from '../../theme';
import {
  AppButton,
  AppInput,
  ButtonRow,
  DetailRow,
  StatusBadge,
} from '../../ui/primitives';
import { StarRating } from '../../ui/StarRating';

export function BookingDetailsSheet({
  selected,
  cancelReason,
  setCancelReason,
  reviewRating,
  setReviewRating,
  reviewComment,
  setReviewComment,
  onClose,
  onComplete,
  completing,
  onCancel,
  cancelling,
  cancelDisabled,
  onSubmitReview,
  submittingReview,
  reviewDisabled,
}: {
  selected: BookingResponse;
  cancelReason: string;
  setCancelReason: (v: string) => void;
  reviewRating: number;
  setReviewRating: (v: number) => void;
  reviewComment: string;
  setReviewComment: (v: string) => void;
  onClose: () => void;
  onComplete: () => void;
  completing: boolean;
  onCancel: () => void;
  cancelling: boolean;
  cancelDisabled: boolean;
  onSubmitReview: () => void;
  submittingReview: boolean;
  reviewDisabled: boolean;
}) {
  const { colors } = useTheme();

  return (
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
        />
        <DetailRow
          label="Completed by handyman"
          value={selected.completed_by_handyman ? 'Yes' : 'No'}
        />
        {selected.completed_at ? (
          <DetailRow
            label="Completed at"
            value={formatDateTime(selected.completed_at)}
          />
        ) : null}
        {selected.cancellation_reason ? (
          <DetailRow
            label="Cancel reason"
            value={selected.cancellation_reason}
          />
        ) : null}
        {selected.failure_reason ? (
          <DetailRow
            label="Failure reason"
            value={selected.failure_reason}
          />
        ) : null}
        {selected.rejection_reason ? (
          <DetailRow
            label="Rejection reason"
            value={selected.rejection_reason}
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
          onPress={onClose}
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
  );
}
