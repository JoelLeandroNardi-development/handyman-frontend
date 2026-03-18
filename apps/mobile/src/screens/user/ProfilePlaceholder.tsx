import React, { useCallback, useEffect, useMemo } from 'react';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { getMeUser, updateMe, type UserResponse } from '@smart/api';
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
  ButtonRow,
  Card,
  CardTitle,
} from '../../ui/primitives';
import { ModalScreen } from '../../ui/ModalScreen';
import {
  ProfileIdentityFields,
  type ProfileIdentityFieldKey,
} from '../../ui/ProfileIdentityFields';
import { ScreenHeader } from '../../ui/ScreenHeader';
import ThemeToggleCard from '../../ui/ThemeToggleCard';

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

export default function ProfilePlaceholder() {
  const api = useMemo(() => createApiClient(), []);
  const { colors } = useTheme();
  const { availableRoles, pickRole, logout } = useSession();
  const { unreadCount } = useNotifications();
  const { bottomGuardHeight, bottomContentPadding } = useBottomGuard();

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

  const handleFieldChange = useCallback(
    (field: ProfileIdentityFieldKey, value: string) => {
      patch(field, value);
    },
    [patch],
  );

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
    <ModalScreen
      scrollable={false}
      style={{
        paddingBottom: 10,
      }}>
      <ScreenHeader
        title="Profile"
        subtitle="Manage your settings and personal information"
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
                <ProfileIdentityFields
                  values={formData}
                  onChange={handleFieldChange}
                />

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
