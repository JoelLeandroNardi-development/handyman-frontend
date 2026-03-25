import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
} from 'react-native';
import Slider from '@react-native-community/slider';
import {
  getSkillsCatalogFlat,
  getMeHandyman,
  updateMeHandyman,
  type HandymanResponse,
  type SkillCatalogFlatResponse,
} from '@smart/api';
import { useApi } from '../../lib/ApiProvider';
import { toNullableString } from '../../lib/profileForm';
import { useTheme } from '../../theme';
import { useSession } from '../../auth/SessionProvider';
import { useAsyncOperation } from '../../hooks/useAsyncOperation';
import { useBottomGuard } from '../../hooks/useBottomGuard';
import { useFormState } from '../../hooks/useFormState';
import { useAppLocation } from '../../location/AppLocationProvider';
import { useNotifications } from '../../notifications/NotificationsProvider';
import { extractDeviceCoordinates } from '../../lib/coordinates';
import {
  AppButton,
  AppInput,
  Card,
  CardTitle,
  Label,
} from '../../ui/primitives';
import {
  ProfileIdentityFields,
  type ProfileIdentityFieldKey,
} from '../../ui/ProfileIdentityFields';
import { SettingsAccountActions } from '../../ui/SettingsAccountActions';
import { SettingsModalShell } from '../../ui/SettingsModalShell';
import { SkillCategorySections } from '../../ui/SkillCategorySections';
import ThemeToggleCard from '../../ui/ThemeToggleCard';

interface HandymanFormData {
  firstName: string;
  lastName: string;
  phone: string;
  nationalId: string;
  addressLine: string;
  postalCode: string;
  city: string;
  country: string;
  yearsExperience: string;
}

const initialFormData: HandymanFormData = {
  firstName: '',
  lastName: '',
  phone: '',
  nationalId: '',
  addressLine: '',
  postalCode: '',
  city: '',
  country: '',
  yearsExperience: '',
};

export default function HandymanSettings() {
  const api = useApi();
  const { colors, tokens } = useTheme();
  const { availableRoles, pickRole, logout } = useSession();
  const { unreadCount } = useNotifications();
  const { bottomGuardHeight, bottomContentPadding } = useBottomGuard();
  const [activeTab, setActiveTab] = useState<'personal' | 'skills'>('personal');

  const [catalog, setCatalog] = React.useState<SkillCatalogFlatResponse | null>(
    null,
  );
  const [selectedSkills, setSelectedSkills] = React.useState<string[]>([]);
  const [serviceRadiusKm, setServiceRadiusKm] = React.useState(0);

  const {
    data: formData,
    patch,
    patchMany,
  } = useFormState<HandymanFormData>(initialFormData);

  const applyProfileData = useCallback(
    (data: HandymanResponse) => {
      setSelectedSkills(data.skills ?? []);
      patchMany({
        firstName: data.first_name ?? '',
        lastName: data.last_name ?? '',
        phone: data.phone ?? '',
        nationalId: data.national_id ?? '',
        addressLine: data.address_line ?? '',
        postalCode: data.postal_code ?? '',
        city: data.city ?? '',
        country: data.country ?? '',
        yearsExperience: String(data.years_experience ?? ''),
      });
      setServiceRadiusKm(
        typeof data.service_radius_km === 'number' ? data.service_radius_km : 0,
      );
    },
    [patchMany],
  );

  const { execute: loadCatalog, loading: loadingCatalog } = useAsyncOperation({
    alertTitle: 'Load Skills Catalog',
  });

  const { execute: loadProfile, loading: loadingProfile } = useAsyncOperation({
    alertTitle: 'Load Profile',
  });

  const { execute: handleProfileSave, loading: saving } = useAsyncOperation({
    alertTitle: 'Save Personal Info',
    onSuccess: () => {
      void loadAll();
    },
  });

  const { execute: handleSkillsSave, loading: savingSkills } = useAsyncOperation({
    alertTitle: 'Save Skills',
    onSuccess: () => {
      void loadAll();
    },
  });

  const { coords: deviceCoords } = useAppLocation();

  async function loadAll() {
    await Promise.all([
      loadCatalog(async () => {
        const data = await getSkillsCatalogFlat(api, { active_only: true });
        setCatalog(data);
      }),
      loadProfile(async () => {
        const data = await getMeHandyman(api);
        applyProfileData(data);
      }),
    ]);
  }

  useEffect(() => {
    void loadAll();
  }, []);

  const handleFieldChange = useCallback(
    (field: ProfileIdentityFieldKey, value: string) => {
      patch(field, value);
    },
    [patch],
  );

  function toggleSkill(skillKey: string) {
    setSelectedSkills(prev =>
      prev.includes(skillKey)
        ? prev.filter(s => s !== skillKey)
        : [...prev, skillKey],
    );
  }

  async function savePersonalInfo() {
    const parsedYears = Number.parseInt(formData.yearsExperience, 10);
    if (Number.isNaN(parsedYears) || parsedYears < 0) {
      throw new Error('Please enter a valid integer for years of experience.');
    }

    const { latitude, longitude } = extractDeviceCoordinates(deviceCoords);

    const updated = await updateMeHandyman(api, {
      first_name: toNullableString(formData.firstName),
      last_name: toNullableString(formData.lastName),
      phone: toNullableString(formData.phone),
      national_id: toNullableString(formData.nationalId),
      address_line: toNullableString(formData.addressLine),
      postal_code: toNullableString(formData.postalCode),
      city: toNullableString(formData.city),
      country: toNullableString(formData.country),
      years_experience: parsedYears,
      service_radius_km: Math.round(serviceRadiusKm),
      latitude,
      longitude,
    });
    applyProfileData(updated);
  }

  async function saveSkills() {
    const updated = await updateMeHandyman(api, {
      skills: selectedSkills,
    });
    setSelectedSkills(updated.skills ?? []);
  }

  return (
    <SettingsModalShell
      subtitle="Manage your settings and handyman information"
      unreadCount={unreadCount}
      bottomGuardHeight={bottomGuardHeight}
      bottomContentPadding={bottomContentPadding}>
      <Card>
        <View
          style={{
            flexDirection: 'row',
            gap: 8,
            padding: 6,
            borderRadius: tokens.nativeRadius.md,
            backgroundColor: colors.surfaceMuted,
          }}>
          <Pressable
            onPress={() => setActiveTab('personal')}
            style={{
              flex: 1,
              minHeight: 44,
              borderRadius: tokens.nativeRadius.sm,
              backgroundColor:
                activeTab === 'personal' ? colors.surface : 'transparent',
              borderWidth: activeTab === 'personal' ? 1 : 0,
              borderColor: colors.border,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text
              style={{
                color:
                  activeTab === 'personal' ? colors.text : colors.textSoft,
                fontWeight: '800',
              }}>
              Personal Info
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setActiveTab('skills')}
            style={{
              flex: 1,
              minHeight: 44,
              borderRadius: tokens.nativeRadius.sm,
              backgroundColor:
                activeTab === 'skills' ? colors.surface : 'transparent',
              borderWidth: activeTab === 'skills' ? 1 : 0,
              borderColor: colors.border,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text
              style={{
                color: activeTab === 'skills' ? colors.text : colors.textSoft,
                fontWeight: '800',
              }}>
              Skills
            </Text>
          </Pressable>
        </View>
      </Card>

      {activeTab === 'personal' ? (
        <>
          <Card>
            <CardTitle title="Handyman details" />

            {loadingProfile ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <>
                <ProfileIdentityFields
                  values={formData}
                  onChange={handleFieldChange}
                />

                <View style={{ gap: 8 }}>
                  <Label>Years of experience</Label>
                  <AppInput
                    value={formData.yearsExperience}
                    onChangeText={value => patch('yearsExperience', value)}
                    keyboardType="number-pad"
                    placeholder="e.g. 5"
                  />
                </View>

                <View style={{ gap: 8 }}>
                  <Label>Service radius: {Math.round(serviceRadiusKm)} km</Label>
                  <Slider
                    minimumValue={0}
                    maximumValue={100}
                    step={1}
                    value={serviceRadiusKm}
                    onValueChange={setServiceRadiusKm}
                    minimumTrackTintColor={colors.primary}
                    maximumTrackTintColor={colors.border}
                  />
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <Text style={{ color: colors.textFaint }}>0 km</Text>
                    <Text style={{ color: colors.textFaint }}>100 km</Text>
                  </View>
                </View>

                <AppButton
                  label="Save personal info"
                  onPress={() => handleProfileSave(savePersonalInfo)}
                  loading={saving}
                  disabled={loadingProfile}
                />
              </>
            )}
          </Card>

          <ThemeToggleCard />
        </>
      ) : (
        <Card>
          <CardTitle
            title="Skills"
            action={
              <Text style={{ color: colors.textFaint, fontWeight: '700' }}>
                {selectedSkills.length} selected
              </Text>
            }
          />

          {loadingCatalog ? (
            <ActivityIndicator color={colors.primary} />
          ) : !catalog || catalog.categories.length === 0 ? (
            <Text style={{ color: colors.textSoft }}>
              No active skills found in catalog.
            </Text>
          ) : (
            <>
              <Text style={{ color: colors.textSoft }}>
                Choose the services you want to be discoverable for. These
                tiles are ready for image backgrounds later.
              </Text>

              <SkillCategorySections
                categories={catalog.categories}
                isSelected={skillKey => selectedSkills.includes(skillKey)}
                onSkillPress={toggleSkill}
              />

              <AppButton
                label="Save skills"
                onPress={() => handleSkillsSave(saveSkills)}
                loading={savingSkills}
                disabled={loadingCatalog}
              />
            </>
          )}
        </Card>
      )}

      <SettingsAccountActions
        availableRoles={availableRoles}
        pickRole={pickRole}
        logout={logout}
      />
    </SettingsModalShell>
  );
}