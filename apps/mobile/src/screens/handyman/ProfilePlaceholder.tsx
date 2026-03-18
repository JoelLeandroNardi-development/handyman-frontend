import React, { useCallback, useEffect, useMemo } from 'react';
import {
  ActivityIndicator,
  ScrollView,
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
import { createApiClient } from '../../lib/api';
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
  ButtonRow,
  Card,
  CardTitle,
  SkillChip,
  Label,
} from '../../ui/primitives';
import { ModalScreen } from '../../ui/ModalScreen';
import {
  ProfileIdentityFields,
  type ProfileIdentityFieldKey,
} from '../../ui/ProfileIdentityFields';
import { ScreenHeader } from '../../ui/ScreenHeader';
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

export default function ProfilePlaceholder() {
  const api = useMemo(() => createApiClient(), []);
  const { colors } = useTheme();
  const { availableRoles, pickRole, logout } = useSession();
  const { unreadCount } = useNotifications();
  const { bottomGuardHeight, bottomContentPadding } = useBottomGuard();

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

  const applyProfileData = React.useCallback(
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
    alertTitle: 'Save Profile',
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

  async function saveProfile() {
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
      skills: selectedSkills,
      years_experience: parsedYears,
      service_radius_km: Math.round(serviceRadiusKm),
      latitude,
      longitude,
    });
    applyProfileData(updated);
  }

  const loading = loadingCatalog || loadingProfile;

  return (
    <ModalScreen
      scrollable={false}
      style={{
        paddingBottom: 10,
      }}>
      <ScreenHeader
        title="Profile"
        subtitle="Manage your settings and handyman information"
        notificationBadgeCount={unreadCount}
        isModal={true}
        modalVariant="compact"
        closeButtonPosition="right"
      />

      <View style={{ flex: 1, minHeight: 0 }}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: 16,
            gap: 14,
            paddingBottom: bottomContentPadding,
          }}>
          <ThemeToggleCard />

          <Card>
            <CardTitle
              title="Handyman details"
              action={
                <AppButton
                  label="Refresh"
                  onPress={() => void loadAll()}
                  style={{ minWidth: 110 }}
                />
              }
            />

            {loading ? (
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
              </>
            )}
          </Card>

          <Card>
            <CardTitle title="Skills" />

            {loading ? (
              <ActivityIndicator color={colors.primary} />
            ) : !catalog || catalog.categories.length === 0 ? (
              <Text style={{ color: colors.textSoft }}>
                No active skills found in catalog.
              </Text>
            ) : (
              <>
                {catalog.categories.map(category => {
                  const skillsInCategory = category.skills.filter(
                    skill => skill.active,
                  );
                  if (skillsInCategory.length === 0) return null;

                  return (
                    <View key={category.key} style={{ gap: 10 }}>
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: '800',
                          color: colors.text,
                        }}>
                        {category.label}
                      </Text>

                      <View
                        style={{
                          flexDirection: 'row',
                          flexWrap: 'wrap',
                          gap: 8,
                        }}>
                        {skillsInCategory.map(skill => (
                          <SkillChip
                            key={skill.key}
                            label={skill.label}
                            selected={selectedSkills.includes(skill.key)}
                            onPress={() => toggleSkill(skill.key)}
                          />
                        ))}
                      </View>
                    </View>
                  );
                })}

                <AppButton
                  label="Save profile"
                  onPress={() => handleProfileSave(saveProfile)}
                  loading={saving}
                  disabled={loading}
                />
              </>
            )}
          </Card>

          {availableRoles.length > 1 ? (
            <Card>
              <CardTitle title="Switch role" />
              <ButtonRow>
                <AppButton
                  label="User"
                  onPress={() => pickRole('user')}
                  tone="secondary"
                  style={{ flex: 1 }}
                />
                <AppButton
                  label="Handyman"
                  onPress={() => pickRole('handyman')}
                  tone="secondary"
                  style={{ flex: 1 }}
                />
              </ButtonRow>
            </Card>
          ) : null}

          <AppButton label="Logout" onPress={logout} />
        </ScrollView>
        <View
          pointerEvents="none"
          style={{
            height: bottomGuardHeight,
            backgroundColor: colors.surface,
          }}
        />
      </View>
    </ModalScreen>
  );
}
