import React from 'react';
import { Text, View } from 'react-native';
import {
  formatDateLabel,
  formatTimeLabel,
} from '../../lib/dateTime';
import { useTheme } from '../../theme';
import {
  AppButton,
  ButtonRow,
  Card,
  CardTitle,
  InputButton,
  Label,
} from '../../ui/primitives';

export function OneOffSlotForm({
  selectedDate,
  startTime,
  endTime,
  previewStart,
  previewEnd,
  onPickDate,
  onPickStart,
  onPickEnd,
  onAdd,
}: {
  selectedDate: Date;
  startTime: Date;
  endTime: Date;
  previewStart: Date;
  previewEnd: Date;
  onPickDate: () => void;
  onPickStart: () => void;
  onPickEnd: () => void;
  onAdd: () => void;
}) {
  const { colors, tokens } = useTheme();

  return (
    <Card>
      <CardTitle title="Add one-off slot" />

      <Text style={{ color: colors.textSoft, fontSize: tokens.typography.bodySmall.size }}>
        Need a slot outside your recurring schedule? Pick a date and time
        to add it manually.
      </Text>

      <View style={{ gap: 8 }}>
        <Label>Date</Label>
        <InputButton
          label={formatDateLabel(selectedDate)}
          onPress={onPickDate}
        />
      </View>

      <ButtonRow>
        <View style={{ flex: 1, gap: 8 }}>
          <Label>Start</Label>
          <InputButton
            label={formatTimeLabel(startTime)}
            onPress={onPickStart}
          />
        </View>
        <View style={{ flex: 1, gap: 8 }}>
          <Label>End</Label>
          <InputButton
            label={formatTimeLabel(endTime)}
            onPress={onPickEnd}
          />
        </View>
      </ButtonRow>

      <View
        style={{
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: tokens.nativeRadius.md,
          padding: 12,
          backgroundColor: colors.surfaceMuted,
        }}>
        <Text style={{ color: colors.textSoft, fontSize: tokens.typography.bodySmall.size }}>
          {previewStart.toLocaleString()} → {previewEnd.toLocaleString()}
        </Text>
      </View>

      <AppButton label="Add slot" onPress={onAdd} />
    </Card>
  );
}
