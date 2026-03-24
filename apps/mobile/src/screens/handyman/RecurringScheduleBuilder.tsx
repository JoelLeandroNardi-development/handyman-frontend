import React, { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import {
  ALL_WEEKDAYS,
  BUSINESS_WEEKDAYS,
  WEEKEND_DAYS,
  WEEKDAY_LABELS,
  isValidTimeRange,
  formatHourMinute,
  type RecurringRule,
  type Weekday,
} from '../../lib/availability';
import { useTheme } from '../../theme';
import {
  AppButton,
  ButtonRow,
  Card,
  CardTitle,
  InputButton,
  Label,
  StatusBadge,
} from '../../ui/primitives';
import { formatTimeLabel } from '../../lib/dateTime';

export interface RecurringScheduleBuilderProps {
  rules: RecurringRule[];
  onRulesChanged: (rules: RecurringRule[]) => void;
}

export function RecurringScheduleBuilder({
  rules,
  onRulesChanged,
}: RecurringScheduleBuilderProps) {
  const { colors, tokens } = useTheme();

  const [selectedDays, setSelectedDays] = useState<Weekday[]>([]);
  const [startTime, setStartTime] = useState<Date>(() => {
    const d = new Date();
    d.setHours(9, 0, 0, 0);
    return d;
  });
  const [endTime, setEndTime] = useState<Date>(() => {
    const d = new Date();
    d.setHours(17, 0, 0, 0);
    return d;
  });
  const [pickerTarget, setPickerTarget] = useState<'start' | 'end' | null>(
    null,
  );

  function toggleDay(day: Weekday) {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day],
    );
  }

  function applyPreset(preset: Weekday[]) {
    setSelectedDays(prev => {
      const same =
        prev.length === preset.length &&
        preset.every(d => prev.includes(d));
      return same ? [] : preset;
    });
  }

  function onPickerChange(event: DateTimePickerEvent, value?: Date) {
    if (event.type === 'dismissed' || !value) {
      setPickerTarget(null);
      return;
    }
    if (pickerTarget === 'start') setStartTime(value);
    if (pickerTarget === 'end') setEndTime(value);
    setPickerTarget(null);
  }

  function addRule() {
    if (selectedDays.length === 0) {
      Alert.alert('Select days', 'Pick at least one weekday.');
      return;
    }
    const sH = startTime.getHours();
    const sM = startTime.getMinutes();
    const eH = endTime.getHours();
    const eM = endTime.getMinutes();

    if (!isValidTimeRange(sH, sM, eH, eM)) {
      Alert.alert('Invalid time', 'End time must be after start time.');
      return;
    }

    const rule: RecurringRule = {
      weekdays: [...selectedDays].sort((a, b) => a - b),
      startHour: sH,
      startMinute: sM,
      endHour: eH,
      endMinute: eM,
    };

    onRulesChanged([...rules, rule]);
    setSelectedDays([]);
  }

  function removeRule(index: number) {
    onRulesChanged(rules.filter((_, i) => i !== index));
  }

  function formatRuleDays(rule: RecurringRule): string {
    if (rule.weekdays.length === 7) return 'Every day';
    if (
      rule.weekdays.length === 5 &&
      BUSINESS_WEEKDAYS.every(d => rule.weekdays.includes(d))
    ) {
      return 'Weekdays';
    }
    if (
      rule.weekdays.length === 2 &&
      WEEKEND_DAYS.every(d => rule.weekdays.includes(d))
    ) {
      return 'Weekends';
    }
    return rule.weekdays.map(d => WEEKDAY_LABELS[d]).join(', ');
  }

  function formatRuleTime(rule: RecurringRule): string {
    return `${formatHourMinute(rule.startHour, rule.startMinute)} – ${formatHourMinute(rule.endHour, rule.endMinute)}`;
  }

  const hasDaysSelected = selectedDays.length > 0;

  return (
    <Card>
      {pickerTarget ? (
        <DateTimePicker
          value={pickerTarget === 'start' ? startTime : endTime}
          mode="time"
          is24Hour
          onChange={onPickerChange}
        />
      ) : null}

      <CardTitle title="Weekly schedule" />

      <Text style={{ color: colors.textSoft, fontSize: tokens.typography.bodySmall.size }}>
        Pick days and a time window, then add the pattern. You can stack
        multiple patterns — for example weekdays 9–17 and Saturday 10–14.
      </Text>

      <View style={{ gap: 8 }}>
        <Label>Days</Label>
        <View
          style={{
            flexDirection: 'row',
            gap: 6,
          }}>
          {ALL_WEEKDAYS.map(day => {
            const active = selectedDays.includes(day);
            return (
              <Pressable
                key={day}
                onPress={() => toggleDay(day)}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: tokens.nativeRadius.md,
                  borderWidth: active ? 2 : 1,
                  borderColor: active ? colors.primary : colors.border,
                  backgroundColor: active
                    ? colors.primarySoft
                    : colors.surface,
                  alignItems: 'center',
                }}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: active }}>
                <Text
                  style={{
                    fontWeight: '800',
                    fontSize: tokens.typography.labelSmall.size,
                    color: active ? colors.primary : colors.textFaint,
                  }}>
                  {WEEKDAY_LABELS[day]}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={{ flexDirection: 'row', gap: 8 }}>
          <PresetChip
            label="Weekdays"
            active={
              selectedDays.length === 5 &&
              BUSINESS_WEEKDAYS.every(d => selectedDays.includes(d))
            }
            onPress={() => applyPreset(BUSINESS_WEEKDAYS)}
          />
          <PresetChip
            label="Weekends"
            active={
              selectedDays.length === 2 &&
              WEEKEND_DAYS.every(d => selectedDays.includes(d))
            }
            onPress={() => applyPreset(WEEKEND_DAYS)}
          />
          <PresetChip
            label="Every day"
            active={selectedDays.length === 7}
            onPress={() => applyPreset([...ALL_WEEKDAYS])}
          />
        </View>
      </View>

      <ButtonRow>
        <View style={{ flex: 1, gap: 8 }}>
          <Label>Start</Label>
          <InputButton
            label={formatTimeLabel(startTime)}
            onPress={() => setPickerTarget('start')}
          />
        </View>
        <View style={{ flex: 1, gap: 8 }}>
          <Label>End</Label>
          <InputButton
            label={formatTimeLabel(endTime)}
            onPress={() => setPickerTarget('end')}
          />
        </View>
      </ButtonRow>

      {hasDaysSelected ? (
        <View
          style={{
            borderRadius: tokens.nativeRadius.md,
            backgroundColor: colors.primarySoft,
            borderWidth: 1,
            borderColor: colors.primary,
            padding: 12,
          }}>
          <Text
            style={{
              color: colors.primary,
              fontSize: tokens.typography.bodySmall.size,
              fontWeight: '700',
            }}>
            {selectedDays.map(d => WEEKDAY_LABELS[d]).join(', ')} ·{' '}
            {formatTimeLabel(startTime)} – {formatTimeLabel(endTime)}
          </Text>
        </View>
      ) : null}

      <AppButton
        label={hasDaysSelected ? 'Add this pattern' : 'Select days first'}
        onPress={addRule}
        disabled={!hasDaysSelected}
      />

      {rules.length > 0 ? (
        <View style={{ gap: 10, marginTop: 4 }}>
          <Label>Active patterns</Label>
          {rules.map((rule, i) => (
            <View
              key={i}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                borderRadius: tokens.nativeRadius.md,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.surfaceMuted,
                padding: 12,
                gap: 10,
              }}>
              <View style={{ flex: 1, gap: 2 }}>
                <Text
                  style={{
                    color: colors.text,
                    fontSize: tokens.typography.body.size,
                    fontWeight: '700',
                  }}>
                  {formatRuleDays(rule)}
                </Text>
                <Text
                  style={{
                    color: colors.textSoft,
                    fontSize: tokens.typography.bodySmall.size,
                  }}>
                  {formatRuleTime(rule)}
                </Text>
              </View>
              <Pressable
                onPress={() => removeRule(i)}
                hitSlop={12}
                accessibilityLabel="Remove pattern"
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
            label="Clear all patterns"
            onPress={() => {
              Alert.alert(
                'Clear patterns?',
                'This removes all recurring patterns. Already-generated slots are not affected.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Clear',
                    style: 'destructive',
                    onPress: () => onRulesChanged([]),
                  },
                ],
              );
            }}
            tone="secondary"
          />
        </View>
      ) : null}
    </Card>
  );
}

function PresetChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const { colors, tokens } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: tokens.nativeRadius.pill,
        borderWidth: 1,
        borderColor: active ? colors.primary : colors.border,
        backgroundColor: active ? colors.primarySoft : colors.surfaceMuted,
      }}>
      <Text
        style={{
          fontWeight: '700',
          fontSize: tokens.typography.labelSmall.size,
          color: active ? colors.primary : colors.textSoft,
        }}>
        {label}
      </Text>
    </Pressable>
  );
}
