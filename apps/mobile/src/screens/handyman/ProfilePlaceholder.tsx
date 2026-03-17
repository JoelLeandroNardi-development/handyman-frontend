import React, { useEffect, useMemo } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  View,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  Label,
  Screen,
  SkillChip,
} from '../../ui/primitives';
import { ScreenHeader } from '../../ui/ScreenHeader';
import ThemeToggleCard from '../../ui/ThemeToggleCard';

export default function ProfilePlaceholder() {
  const api = useMemo(() => createApiClient(), []);
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { availableRoles, pickRole, logout } = useSession();
  const { unreadCount } = useNotifications();

  const screenHeight = Dimensions.get('window').height;
  const maxHeight = screenHeight - Math.max(insets.bottom);

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
    <Screen
      style={{
        paddingBottom: 10,
        maxHeight,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        overflow: 'hidden',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
      }}>
      <ScreenHeader
        title="Profile"
        subtitle="Manage your settings and handyman information"
        notificationBadgeCount={unreadCount}
        isModal={true}
        closeButtonPosition="right"
      />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          gap: 14,
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
              <View style={{ gap: 8 }}>
                <Label>First name</Label>
                <AppInput
                  value={formData.firstName}
                  onChangeText={v => patch('firstName', v)}
                  placeholder="First name"
                />
              </View>

              <View style={{ gap: 8 }}>
                <Label>Last name</Label>
                <AppInput
                  value={formData.lastName}
                  onChangeText={v => patch('lastName', v)}
                  placeholder="Last name"
                />
              </View>

              <View style={{ gap: 8 }}>
                <Label>Phone</Label>
                <AppInput
                  value={formData.phone}
                  onChangeText={v => patch('phone', v)}
                  placeholder="Phone"
                  keyboardType="phone-pad"
                />
              </View>

              <View style={{ gap: 8 }}>
                <Label>National ID</Label>
                <AppInput
                  value={formData.nationalId}
                  onChangeText={v => patch('nationalId', v)}
                  placeholder="National ID"
                />
              </View>

              <View style={{ gap: 8 }}>
                <Label>Address line</Label>
                <AppInput
                  value={formData.addressLine}
                  onChangeText={v => patch('addressLine', v)}
                  placeholder="Address line"
                />
              </View>

              <ButtonRow>
                <View style={{ flex: 1, gap: 8 }}>
                  <Label>Postal code</Label>
                  <AppInput
                    value={formData.postalCode}
                    onChangeText={v => patch('postalCode', v)}
                    placeholder="Postal code"
                  />
                </View>
                <View style={{ flex: 1, gap: 8 }}>
                  <Label>City</Label>
                  <AppInput
                    value={formData.city}
                    onChangeText={v => patch('city', v)}
                    placeholder="City"
                  />
                </View>
              </ButtonRow>

              <View style={{ gap: 8 }}>
                <Label>Country</Label>
                <AppInput
                  value={formData.country}
                  onChangeText={v => patch('country', v)}
                  placeholder="Country"
                />
              </View>

              <View style={{ gap: 8 }}>
                <Label>Years of experience</Label>
                <AppInput
                  value={formData.yearsExperience}
                  onChangeText={v => patch('yearsExperience', v)}
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
                const skillsInCategory = category.skills.filter(s => s.active);
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
    </Screen>
  );
}
