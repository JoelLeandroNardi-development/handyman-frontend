import React, { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import {
  getSkillsCatalogFlat,
  type SkillCatalogFlatResponse,
} from '@smart/api';
import {
  combineDateAndTime,
  formatDateLabel,
  formatTimeLabel,
} from '../../../lib/dateTime';
import { useTheme } from '../../../theme';
import {
  AppButton,
  AppInput,
  ButtonRow,
  Card,
  CardTitle,
  InputButton,
  Label,
} from '../../../ui/primitives';
import { flattenSkills, type Coords, type SkillOption } from './utils';

type PickerTarget = 'date' | 'start' | 'end' | null;

export interface SearchFiltersProps {
  api: any;
  catalog: SkillCatalogFlatResponse | null;
  selectedSkillKey: string;
  selectedDate: Date;
  startTime: Date;
  endTime: Date;
  jobDescription: string;
  userCoords: Coords | null;
  loadingMatch: boolean;
  bookingSuccess: string | null;

  onCatalogLoaded: (catalog: SkillCatalogFlatResponse) => void;
  onSkillKeySelected: (skillKey: string) => void;
  onDateChanged: (date: Date) => void;
  onStartTimeChanged: (time: Date) => void;
  onEndTimeChanged: (time: Date) => void;
  onJobDescriptionChanged: (desc: string) => void;
  onMatch: () => void;
  onSkillModalOpen: () => void;
}

export function SearchFilters({
  api,
  catalog,
  selectedSkillKey,
  selectedDate,
  startTime,
  endTime,
  jobDescription,
  userCoords,
  loadingMatch,
  bookingSuccess,
  onCatalogLoaded,
  onSkillKeySelected,
  onDateChanged,
  onStartTimeChanged,
  onEndTimeChanged,
  onJobDescriptionChanged,
  onMatch,
  onSkillModalOpen,
}: SearchFiltersProps) {
  const { colors } = useTheme();
  const [pickerTarget, setPickerTarget] = useState<PickerTarget>(null);

  const desiredStartDate = combineDateAndTime(selectedDate, startTime);
  const desiredEndDate = combineDateAndTime(selectedDate, endTime);
  const skillOptions = flattenSkills(catalog);
  const selectedSkill =
    skillOptions.find(s => s.key === selectedSkillKey) ?? null;

  async function loadCatalog() {
    try {
      const data = await getSkillsCatalogFlat(api, { active_only: true });
      onCatalogLoaded(data);

      if (!selectedSkillKey && data.allowed_skill_keys.length > 0) {
        onSkillKeySelected(data.allowed_skill_keys[0]);
      }
    } catch (e) {
      Alert.alert('Could not load skills', (e as Error).message);
    }
  }

  React.useEffect(() => {
    void loadCatalog();
  }, []);

  function onPickerChange(event: DateTimePickerEvent, value?: Date) {
    if (event.type === 'dismissed' || !value) {
      setPickerTarget(null);
      return;
    }

    if (pickerTarget === 'date') onDateChanged(value);
    if (pickerTarget === 'start') onStartTimeChanged(value);
    if (pickerTarget === 'end') onEndTimeChanged(value);

    setPickerTarget(null);
  }

  function handleMatch() {
    if (!userCoords) {
      Alert.alert(
        'Location required',
        'Please enable location permission in settings.',
      );
      return;
    }
    if (!selectedSkillKey) {
      Alert.alert('Missing skill', 'Please choose a skill.');
      return;
    }
    if (desiredEndDate <= desiredStartDate) {
      Alert.alert('Invalid time range', 'End time must be after start time.');
      return;
    }

    onMatch();
  }

  return (
    <>
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

      <Card>
        <CardTitle
          title="Search setup"
          action={
            selectedSkill ? (
              <Text style={{ color: colors.textFaint, fontWeight: '700' }}>
                {selectedSkill.categoryLabel}
              </Text>
            ) : undefined
          }
        />

        <View style={{ gap: 8 }}>
          <Label>Skill</Label>
          <Pressable
            onPress={onSkillModalOpen}
            style={{
              borderRadius: 16,
              borderWidth: 1,
              borderColor: selectedSkill ? colors.primary : colors.border,
              backgroundColor: selectedSkill ? colors.primarySoft : colors.surface,
              padding: 14,
              gap: 6,
            }}>
            <Text
              style={{
                color: colors.textFaint,
                fontSize: 12,
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: 0.6,
              }}>
              {!catalog ? 'Loading skills' : 'Selected skill'}
            </Text>
            <Text
              style={{
                color: colors.text,
                fontSize: 16,
                fontWeight: '800',
              }}>
              {selectedSkill
                ? selectedSkill.label
                : 'Choose a skill to start matching'}
            </Text>
          </Pressable>
        </View>

        <View style={{ gap: 8 }}>
          <Label>Job description</Label>
          <AppInput
            value={jobDescription}
            onChangeText={onJobDescriptionChanged}
            placeholder="Describe what needs to be fixed..."
          />
        </View>

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
            backgroundColor: colors.surfaceMuted,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: colors.border,
            padding: 12,
          }}>
          <Text style={{ color: colors.textSoft }}>
            Requested window: {desiredStartDate.toLocaleString()} →{' '}
            {desiredEndDate.toLocaleString()}
          </Text>
        </View>

        <ButtonRow>
          <AppButton
            label="Match"
            onPress={handleMatch}
            loading={loadingMatch}
            disabled={!userCoords || !selectedSkillKey}
            style={{ flex: 1 }}
          />
        </ButtonRow>

        {bookingSuccess ? (
          <View
            style={{
              backgroundColor: colors.successSoft,
              borderColor: colors.success,
              borderWidth: 1,
              borderRadius: 16,
              padding: 12,
            }}>
            <Text style={{ color: colors.success, fontWeight: '700' }}>
              {bookingSuccess}
            </Text>
          </View>
        ) : null}
      </Card>
    </>
  );
}
