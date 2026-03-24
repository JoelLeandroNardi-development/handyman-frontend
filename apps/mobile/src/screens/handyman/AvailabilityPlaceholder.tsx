import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { APP_BACKGROUND_IMAGE } from '../../theme/appChrome';
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import {
  clearMyAvailability,
  getMyAvailability,
  setMyAvailability,
  type AvailabilitySlot,
} from '@smart/api';
import { createApiClient } from '../../lib/api';
import {
  combineDateAndTime,
  formatDateLabel,
  formatTimeLabel,
} from '../../lib/dateTime';
import {
  groupSlotsByDate,
  materializeSchedule,
  normalizeAvailabilityResponse,
  previewGenerateCount,
  sortAvailabilitySlots,
  type RecurringRule,
} from '../../lib/availability';
import { useAsyncOperation } from '../../hooks/useAsyncOperation';
import { useTheme } from '../../theme';
import {
  AppButton,
  ButtonRow,
  Card,
  CardTitle,
  EmptyState,
  InputButton,
  Label,
  Screen,
  StatusBadge,
} from '../../ui/primitives';
import { ScreenHeader } from '../../ui/ScreenHeader';
import { useNotifications } from '../../notifications/NotificationsProvider';
import { RecurringScheduleBuilder } from './RecurringScheduleBuilder';
import { BlockoutDatePicker } from './BlockoutDatePicker';

type PickerTarget = 'date' | 'start' | 'end' | null;
type ScreenTab = 'recurring' | 'one-off' | 'blockout';

export default function AvailabilityPlaceholder() {
  const api = useMemo(() => createApiClient(), []);
  const { colors, tokens } = useTheme();
  const { unreadCount } = useNotifications();

  const loadOp = useAsyncOperation({ alertTitle: 'Could not load availability' });
  const saveOp = useAsyncOperation({ alertTitle: 'Save failed' });
  const clearOp = useAsyncOperation({ alertTitle: 'Clear failed' });
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);

  const [rules, setRules] = useState<RecurringRule[]>([]);
  const [blockedDates, setBlockedDates] = useState<string[]>([]);

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [startTime, setStartTime] = useState<Date>(() => {
    const d = new Date();
    d.setHours(d.getHours() + 1, 0, 0, 0);
    return d;
  });
  const [endTime, setEndTime] = useState<Date>(() => {
    const d = new Date();
    d.setHours(d.getHours() + 2, 0, 0, 0);
    return d;
  });
  const [pickerTarget, setPickerTarget] = useState<PickerTarget>(null);

  const [activeTab, setActiveTab] = useState<ScreenTab>('recurring');

  const slotGroups = useMemo(() => groupSlotsByDate(slots), [slots]);
  const pendingGenCount = useMemo(
    () => (rules.length > 0 ? previewGenerateCount(rules, blockedDates, slots) : 0),
    [rules, blockedDates, slots],
  );
  const hasUnsavedChanges = slots.length > 0;

  async function loadAvailability() {
    await loadOp.execute(async () => {
      const data = await getMyAvailability(api);
      setSlots(sortAvailabilitySlots(normalizeAvailabilityResponse(data)));
    });
  }

  useEffect(() => {
    void loadAvailability();
  }, []);

  function onPickerChange(event: DateTimePickerEvent, value?: Date) {
    if (event.type === 'dismissed' || !value) {
      setPickerTarget(null);
      return;
    }

    if (pickerTarget === 'date') setSelectedDate(value);
    if (pickerTarget === 'start') setStartTime(value);
    if (pickerTarget === 'end') setEndTime(value);

    setPickerTarget(null);
  }

  function addDraftSlot() {
    const start = combineDateAndTime(selectedDate, startTime);
    const end = combineDateAndTime(selectedDate, endTime);

    if (end <= start) {
      Alert.alert('Invalid range', 'End must be after start.');
      return;
    }

    setSlots(prev =>
      sortAvailabilitySlots([
        ...prev,
        { start: start.toISOString(), end: end.toISOString() },
      ]),
    );
  }

  function removeSlot(index: number) {
    setSlots(prev => prev.filter((_, i) => i !== index));
  }

  function generateFromRules() {
    if (rules.length === 0) {
      Alert.alert('No patterns', 'Add at least one recurring pattern first.');
      return;
    }

    const before = slots.length;
    const materialized = materializeSchedule(rules, blockedDates, slots);
    setSlots(materialized);

    const added = materialized.length - before;
    Alert.alert(
      'Slots generated',
      added > 0
        ? `Added ${added} new slot(s) for the next 14 days.`
        : 'No new slots were added — all already exist or are blocked.',
    );
  }

  async function saveAvailability() {
    await saveOp.execute(async () => {
      await setMyAvailability(api, { slots });
      Alert.alert('Saved', `${slots.length} slot(s) saved successfully.`);
      await loadAvailability();
    });
  }

  function confirmClearAll() {
    Alert.alert(
      'Clear everything?',
      'This removes all slots from the server and resets your local patterns and blockouts.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear all',
          style: 'destructive',
          onPress: clearAvailability,
        },
      ],
    );
  }

  async function clearAvailability() {
    await clearOp.execute(async () => {
      await clearMyAvailability(api);
      setSlots([]);
      setRules([]);
      setBlockedDates([]);
      Alert.alert('Cleared', 'All availability data was removed.');
    });
  }

  const previewStart = combineDateAndTime(selectedDate, startTime);
  const previewEnd = combineDateAndTime(selectedDate, endTime);

  const tabs: { key: ScreenTab; label: string; badge?: string }[] = [
    { key: 'recurring', label: 'Recurring', badge: rules.length > 0 ? String(rules.length) : undefined },
    { key: 'one-off', label: 'One-off' },
    { key: 'blockout', label: 'Blockouts', badge: blockedDates.length > 0 ? String(blockedDates.length) : undefined },
  ];

  return (
    <Screen backgroundImage={APP_BACKGROUND_IMAGE}>
      {pickerTarget ? (
        <DateTimePicker
          value={
            pickerTarget === 'date'
              ? selectedDate
              : pickerTarget === 'start'
                ? startTime
                : endTime
          }
          mode={pickerTarget === 'date' ? 'date' : 'time'}
          is24Hour
          onChange={onPickerChange}
        />
      ) : null}

      <ScreenHeader
        title="Availability"
        subtitle="Manage the time slots you can accept jobs"
        notificationBadgeCount={unreadCount}
      />

      <View
        style={{
          flexDirection: 'row',
          marginHorizontal: 16,
          marginTop: 12,
          marginBottom: 14,
          borderRadius: tokens.nativeRadius.md,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.surfaceMuted,
          overflow: 'hidden',
        }}>
        {tabs.map((tab, i) => {
          const active = activeTab === tab.key;
          return (
            <Pressable
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              style={{
                flex: 1,
                paddingVertical: 12,
                backgroundColor: active ? colors.primary : 'transparent',
                borderLeftWidth: i > 0 ? 1 : 0,
                borderLeftColor: colors.border,
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row',
                gap: 6,
              }}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}>
              <Text
                style={{
                  fontWeight: '800',
                  fontSize: tokens.typography.labelSmall.size,
                  color: active ? '#ffffff' : colors.textSoft,
                }}>
                {tab.label}
              </Text>
              {tab.badge ? (
                <View
                  style={{
                    minWidth: 18,
                    height: 18,
                    borderRadius: 9,
                    backgroundColor: active ? 'rgba(255,255,255,0.3)' : colors.primary,
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingHorizontal: 4,
                  }}>
                  <Text
                    style={{
                      color: active ? '#ffffff' : '#ffffff',
                      fontSize: 10,
                      fontWeight: '800',
                    }}>
                    {tab.badge}
                  </Text>
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120, gap: 12 }}
        showsVerticalScrollIndicator={false}>

        {activeTab === 'recurring' ? (
          <>
            <RecurringScheduleBuilder
              rules={rules}
              onRulesChanged={setRules}
            />

            {rules.length > 0 ? (
              <Card>
                <CardTitle title="Generate slots" />
                <Text style={{ color: colors.textSoft, fontSize: tokens.typography.bodySmall.size }}>
                  Materialise patterns into concrete slots for the next 14 days.
                  Blocked dates and existing duplicates are skipped automatically.
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                  <StatusBadge
                    label={`${rules.length} pattern${rules.length === 1 ? '' : 's'}`}
                    tone="info"
                  />
                  {blockedDates.length > 0 ? (
                    <StatusBadge
                      label={`${blockedDates.length} blockout${blockedDates.length === 1 ? '' : 's'}`}
                      tone="warning"
                    />
                  ) : null}
                  <StatusBadge
                    label={
                      pendingGenCount > 0
                        ? `~${pendingGenCount} new slot${pendingGenCount === 1 ? '' : 's'}`
                        : 'No new slots'
                    }
                    tone={pendingGenCount > 0 ? 'success' : 'neutral'}
                  />
                </View>
                <AppButton
                  label={
                    pendingGenCount > 0
                      ? `Generate ${pendingGenCount} slot${pendingGenCount === 1 ? '' : 's'}`
                      : 'Generate (no new slots)'
                  }
                  onPress={generateFromRules}
                  disabled={pendingGenCount === 0}
                />
              </Card>
            ) : null}
          </>
        ) : null}

        {activeTab === 'one-off' ? (
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
                onPress={() => setPickerTarget('date')}
              />
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

            <AppButton label="Add slot" onPress={addDraftSlot} />
          </Card>
        ) : null}

        {activeTab === 'blockout' ? (
          <BlockoutDatePicker
            blockedDates={blockedDates}
            onBlockedDatesChanged={setBlockedDates}
          />
        ) : null}

        <View style={{ gap: 4, marginTop: 4 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: colors.text }}>
              Slots
            </Text>
            <Text style={{ color: colors.textFaint, fontSize: tokens.typography.labelSmall.size }}>
              {slots.length} total
            </Text>
          </View>
        </View>

        {loadOp.loading ? (
          <View style={{ paddingVertical: 32, alignItems: 'center' }}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : slotGroups.length === 0 ? (
          <EmptyState text={
            activeTab === 'recurring'
              ? 'No slots yet. Create a recurring pattern above and generate.'
              : activeTab === 'one-off'
                ? 'No slots yet. Add a one-off slot above.'
                : 'No slots yet.'
          } />
        ) : (
          slotGroups.map(group => (
            <Card key={group.dateKey} style={{ gap: 8 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontWeight: '800', fontSize: tokens.typography.subtitle.size, color: colors.text }}>
                  {group.dateLabel}
                </Text>
                <Text style={{ color: colors.textFaint, fontSize: tokens.typography.labelSmall.size }}>
                  {group.slots.length} slot{group.slots.length === 1 ? '' : 's'}
                </Text>
              </View>

              {group.slots.map(({ slot, originalIndex }) => {
                const start = new Date(slot.start);
                const end = new Date(slot.end);
                const timeStr = `${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

                return (
                  <View
                    key={`${slot.start}-${slot.end}`}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      borderRadius: tokens.nativeRadius.sm,
                      backgroundColor: colors.surfaceMuted,
                      paddingLeft: 14,
                      paddingRight: 6,
                      paddingVertical: 10,
                      gap: 8,
                    }}>
                    <Text style={{ flex: 1, color: colors.textSoft, fontSize: tokens.typography.body.size, fontWeight: '600' }}>
                      {timeStr}
                    </Text>
                    <Pressable
                      onPress={() => removeSlot(originalIndex)}
                      hitSlop={12}
                      accessibilityLabel="Remove slot"
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: tokens.nativeRadius.sm,
                        backgroundColor: colors.dangerSoft,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                      <Text style={{ color: colors.danger, fontWeight: '800', fontSize: 12 }}>
                        ✕
                      </Text>
                    </Pressable>
                  </View>
                );
              })}
            </Card>
          ))
        )}
      </ScrollView>

      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          padding: 16,
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        }}>
        <ButtonRow>
          <AppButton
            label="Clear all"
            onPress={confirmClearAll}
            tone="danger"
            loading={clearOp.loading}
            style={{ flex: 1 }}
          />
          <AppButton
            label={`Save${slots.length > 0 ? ` (${slots.length})` : ''}`}
            onPress={saveAvailability}
            loading={saveOp.loading}
            disabled={!hasUnsavedChanges && !saveOp.loading}
            style={{ flex: 1 }}
          />
        </ButtonRow>
      </View>
    </Screen>
  );
}
