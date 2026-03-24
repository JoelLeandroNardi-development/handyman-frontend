import React, { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { toDateKey } from '../../lib/availability';
import { formatDateLabel } from '../../lib/dateTime';
import { useTheme } from '../../theme';
import {
  AppButton,
  Card,
  CardTitle,
  StatusBadge,
} from '../../ui/primitives';

export interface BlockoutDatePickerProps {
  blockedDates: string[]; // "YYYY-MM-DD"
  onBlockedDatesChanged: (dates: string[]) => void;
}

export function BlockoutDatePicker({
  blockedDates,
  onBlockedDatesChanged,
}: BlockoutDatePickerProps) {
  const { colors, tokens } = useTheme();
  const [pickerOpen, setPickerOpen] = useState(false);

  function onPickerChange(event: DateTimePickerEvent, value?: Date) {
    setPickerOpen(false);
    if (event.type === 'dismissed' || !value) return;

    const key = toDateKey(value);
    if (blockedDates.includes(key)) return;
    onBlockedDatesChanged([...blockedDates, key].sort());
  }

  function removeBlockout(dateKey: string) {
    onBlockedDatesChanged(blockedDates.filter(d => d !== dateKey));
  }

  function formatBlockedLabel(dateKey: string): string {
    const [y, m, d] = dateKey.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return formatDateLabel(date);
  }

  function isToday(dateKey: string): boolean {
    return dateKey === toDateKey(new Date());
  }

  function isPast(dateKey: string): boolean {
    const today = toDateKey(new Date());
    return dateKey < today;
  }

  return (
    <Card>
      {pickerOpen ? (
        <DateTimePicker
          value={new Date()}
          mode="date"
          minimumDate={new Date()}
          onChange={onPickerChange}
        />
      ) : null}

      <CardTitle title="Blockout dates" />

      <Text style={{ color: colors.textSoft, fontSize: tokens.typography.bodySmall.size }}>
        Mark days you're unavailable — vacation, appointments, holidays.
        Recurring slots on blocked dates won't be generated.
      </Text>

      <AppButton
        label={`+ Block a date${blockedDates.length > 0 ? ` (${blockedDates.length} blocked)` : ''}`}
        onPress={() => setPickerOpen(true)}
        tone="secondary"
      />

      {blockedDates.length > 0 ? (
        <View style={{ gap: 8 }}>
          {blockedDates.map(dateKey => (
            <View
              key={dateKey}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                borderRadius: tokens.nativeRadius.md,
                borderWidth: 1,
                borderColor: isPast(dateKey) ? colors.border : colors.borderStrong,
                backgroundColor: colors.surfaceMuted,
                paddingLeft: 14,
                paddingRight: 6,
                paddingVertical: 10,
                gap: 8,
                opacity: isPast(dateKey) ? 0.5 : 1,
              }}>
              <Text
                style={{
                  flex: 1,
                  color: colors.text,
                  fontSize: tokens.typography.body.size,
                  fontWeight: '600',
                }}>
                {formatBlockedLabel(dateKey)}
              </Text>
              {isToday(dateKey) ? (
                <StatusBadge label="Today" tone="warning" />
              ) : null}
              <Pressable
                onPress={() => removeBlockout(dateKey)}
                hitSlop={12}
                accessibilityLabel={`Remove blockout ${formatBlockedLabel(dateKey)}`}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: tokens.nativeRadius.sm,
                  backgroundColor: colors.dangerSoft,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Text
                  style={{
                    color: colors.danger,
                    fontWeight: '800',
                    fontSize: tokens.typography.label.size,
                  }}>
                  ✕
                </Text>
              </Pressable>
            </View>
          ))}
          <AppButton
            label="Clear all blockouts"
            onPress={() => {
              Alert.alert(
                'Clear blockouts?',
                'This removes all blocked dates.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Clear',
                    style: 'destructive',
                    onPress: () => onBlockedDatesChanged([]),
                  },
                ],
              );
            }}
            tone="secondary"
          />
        </View>
      ) : (
        <View
          style={{
            borderRadius: tokens.nativeRadius.md,
            backgroundColor: colors.successSoft,
            borderWidth: 1,
            borderColor: colors.success,
            padding: 12,
          }}>
          <Text
            style={{
              color: colors.success,
              fontSize: tokens.typography.bodySmall.size,
              fontWeight: '700',
            }}>
            No blockout dates — all recurring slots will be generated.
          </Text>
        </View>
      )}
    </Card>
  );
}
