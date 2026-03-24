import React from 'react';
import { Text, View } from 'react-native';
import { type BookingResponse } from '@smart/api';
import { getBookingDisplayStatus, getBookingStatusTone } from '@smart/core';
import { formatDateTime } from '../../lib/dateTime';
import { useTheme } from '../../theme';
import { AppButton, Card, StatusBadge } from '../../ui/primitives';

export function JobCard({
  item,
  onPress,
}: {
  item: BookingResponse;
  onPress: () => void;
}) {
  const { colors } = useTheme();

  return (
    <Card style={{ marginBottom: 12, backgroundColor: colors.surfaceElevated, gap: 14 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 18, fontWeight: '800', color: colors.text }}>{item.user_email}</Text>
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
          label={getBookingDisplayStatus(item.status, 'handyman')}
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
          <Text style={{ color: colors.danger, lineHeight: 22 }}>{item.rejection_reason || 'No reason given'}</Text>
        </View>
      ) : null}

      <AppButton
        label="Open actions"
        onPress={onPress}
        tone="secondary"
        style={{ minHeight: 48 }}
      />
    </Card>
  );
}
