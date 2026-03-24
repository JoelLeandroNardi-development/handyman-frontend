import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { type BookingResponse } from '@smart/api';
import {
  getBookingDisplayStatus,
  getBookingStatusTone,
  isIncomingLikeBookingStatus,
} from '@smart/core';
import { canCompleteJob, canRejectJob } from '../../lib/bookingSections';
import { formatDateTime } from '../../lib/dateTime';
import { useTheme } from '../../theme';
import {
  AppButton,
  AppInput,
  ButtonRow,
  DetailRow,
  StatusBadge,
} from '../../ui/primitives';

export function JobDetailsSheet({
  selected,
  rejectReason,
  setRejectReason,
  onClose,
  onConfirm,
  confirming,
  onComplete,
  completing,
  onReject,
  rejecting,
}: {
  selected: BookingResponse;
  rejectReason: string;
  setRejectReason: (v: string) => void;
  onClose: () => void;
  onConfirm: () => void;
  confirming: boolean;
  onComplete: () => void;
  completing: boolean;
  onReject: () => void;
  rejecting: boolean;
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
            label={getBookingDisplayStatus(selected.status, 'handyman')}
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
        <DetailRow label="Completed by user" value={selected.completed_by_user ? 'Yes' : 'No'} />
        <DetailRow label="Completed by handyman" value={selected.completed_by_handyman ? 'Yes' : 'No'} />
        {selected.completed_at ? (
          <DetailRow label="Completed at" value={formatDateTime(selected.completed_at)} />
        ) : null}
        {selected.rejection_reason ? (
          <DetailRow label="Rejection reason" value={selected.rejection_reason} />
        ) : null}
      </View>

      {canRejectJob(selected) ? (
        <View style={{ gap: 8 }}>
          <Text style={{ fontWeight: '700', color: colors.text }}>Reject reason</Text>
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
          onPress={onClose}
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
  );
}
