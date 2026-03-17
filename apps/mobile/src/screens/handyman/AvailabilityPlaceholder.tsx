import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Text, View } from 'react-native';
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
  formatDateTime,
  formatTimeLabel,
} from '../../lib/dateTime';
import {
  normalizeAvailabilityResponse,
  sortAvailabilitySlots,
} from '../../lib/availability';
import { useTheme } from '../../theme';
import {
  AppButton,
  ButtonRow,
  Card,
  CardTitle,
  EmptyState,
  InputButton,
  Label,
  PageHeader,
  Screen,
} from '../../ui/primitives';

type PickerTarget = 'date' | 'start' | 'end' | null;

export default function AvailabilityPlaceholder() {
  const api = useMemo(() => createApiClient(), []);
  const { colors } = useTheme();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
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

  async function loadAvailability() {
    setLoading(true);
    try {
      const data = await getMyAvailability(api);
      setSlots(sortAvailabilitySlots(normalizeAvailabilityResponse(data)));
    } catch (e) {
      Alert.alert('Could not load availability', (e as Error).message);
    } finally {
      setLoading(false);
    }
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
        {
          start: start.toISOString(),
          end: end.toISOString(),
        },
      ]),
    );
  }

  function removeSlot(index: number) {
    setSlots(prev => prev.filter((_, i) => i !== index));
  }

  async function saveAvailability() {
    setSaving(true);
    try {
      await setMyAvailability(api, { slots });
      Alert.alert('Availability saved', `Saved ${slots.length} slot(s).`);
      await loadAvailability();
    } catch (e) {
      Alert.alert('Save failed', (e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function clearAvailability() {
    setClearing(true);
    try {
      await clearMyAvailability(api);
      setSlots([]);
      Alert.alert('Availability cleared', 'All slots were removed.');
    } catch (e) {
      Alert.alert('Clear failed', (e as Error).message);
    } finally {
      setClearing(false);
    }
  }

  const previewStart = combineDateAndTime(selectedDate, startTime);
  const previewEnd = combineDateAndTime(selectedDate, endTime);

  return (
    <Screen>
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

      <View style={{ paddingHorizontal: 16, paddingTop: 16, marginBottom: 14 }}>
        <PageHeader
          title="Availability"
          subtitle="Manage the time slots you can accept jobs"
          action={
            <AppButton
              label="Refresh"
              onPress={loadAvailability}
              style={{ minWidth: 120 }}
            />
          }
        />
      </View>

      <FlatList
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }}
        data={slots}
        keyExtractor={(item, index) => `${item.start}-${item.end}-${index}`}
        ListHeaderComponent={
          <View style={{ gap: 12, marginBottom: 12 }}>
            <Card>
              <CardTitle title="Add slot" />

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
                  borderRadius: 16,
                  padding: 12,
                  backgroundColor: colors.surfaceMuted,
                }}>
                <Text style={{ color: colors.textSoft }}>
                  Slot preview: {previewStart.toLocaleString()} →{' '}
                  {previewEnd.toLocaleString()}
                </Text>
              </View>

              <AppButton label="Add slot locally" onPress={addDraftSlot} />
            </Card>

            <Text
              style={{ fontSize: 18, fontWeight: '800', color: colors.text }}>
              Current slots
            </Text>
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <View style={{ paddingVertical: 32, alignItems: 'center' }}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : (
            <EmptyState text="No availability slots yet." />
          )
        }
        renderItem={({ item, index }) => (
          <Card style={{ marginBottom: 10 }}>
            <Text
              style={{ fontSize: 16, fontWeight: '800', color: colors.text }}>
              Slot {index + 1}
            </Text>
            <Text style={{ color: colors.textSoft }}>
              Start: {formatDateTime(item.start)}
            </Text>
            <Text style={{ color: colors.textSoft }}>
              End: {formatDateTime(item.end)}
            </Text>
            <AppButton
              label="Remove"
              onPress={() => removeSlot(index)}
              tone="secondary"
            />
          </Card>
        )}
      />

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
            onPress={clearAvailability}
            tone="danger"
            loading={clearing}
            style={{ flex: 1 }}
          />
          <AppButton
            label="Save slots"
            onPress={saveAvailability}
            loading={saving}
            style={{ flex: 1 }}
          />
        </ButtonRow>
      </View>
    </Screen>
  );
}
