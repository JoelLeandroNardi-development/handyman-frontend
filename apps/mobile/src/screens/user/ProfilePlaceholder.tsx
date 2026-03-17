import React, { useEffect, useMemo } from 'react';
import { ActivityIndicator, ScrollView, View, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getMeUser, updateMe, type UserResponse } from '@smart/api';
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

  interface UserFormData {
    firstName: string;
    lastName: string;
    phone: string;
    nationalId: string;
    addressLine: string;
    postalCode: string;
    city: string;
    country: string;
  }

  const initialFormData: UserFormData = {
    firstName: '',
    lastName: '',
    phone: '',
    nationalId: '',
    addressLine: '',
    postalCode: '',
    city: '',
    country: '',
  };

  const {
    data: formData,
    patch,
    patchMany,
  } = useFormState<UserFormData>(initialFormData);

  const applyProfileData = React.useCallback(
    (data: UserResponse) => {
      patchMany({
        firstName: data.first_name ?? '',
        lastName: data.last_name ?? '',
        phone: data.phone ?? '',
        nationalId: data.national_id ?? '',
        addressLine: data.address_line ?? '',
        postalCode: data.postal_code ?? '',
        city: data.city ?? '',
        country: data.country ?? '',
      });
    },
    [patchMany],
  );

  const fetchProfile = React.useCallback(async () => {
    const data = await getMeUser(api);
    applyProfileData(data);
  }, [api, applyProfileData]);

  const { execute: loadProfile, loading: loadingProfile } = useAsyncOperation({
    alertTitle: 'Load Profile',
  });

  const { execute: handleProfileSave, loading: saving } = useAsyncOperation({
    alertTitle: 'Save Profile',
    onSuccess: () => {
      loadProfile(fetchProfile);
    },
  });

  const { coords: deviceCoords } = useAppLocation();

  useEffect(() => {
    loadProfile(fetchProfile);
  }, [fetchProfile]);

  async function saveProfile() {
    const { latitude, longitude } = extractDeviceCoordinates(deviceCoords);

    await updateMe(api, {
      first_name: toNullableString(formData.firstName),
      last_name: toNullableString(formData.lastName),
      phone: toNullableString(formData.phone),
      national_id: toNullableString(formData.nationalId),
      address_line: toNullableString(formData.addressLine),
      postal_code: toNullableString(formData.postalCode),
      city: toNullableString(formData.city),
      country: toNullableString(formData.country),
      latitude,
      longitude,
    });
  }

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
        subtitle="Manage your settings and personal information"
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
            title="User details"
            action={
              <AppButton
                label="Refresh"
                onPress={() => loadProfile(fetchProfile)}
                style={{ minWidth: 110 }}
              />
            }
          />

          {loadingProfile ? (
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

              <AppButton
                label="Save profile"
                onPress={() => handleProfileSave(saveProfile)}
                loading={saving}
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
