import React, { useCallback, useEffect } from 'react';
import { ActivityIndicator } from 'react-native';
import { getMeUser, updateMe, type UserResponse } from '@smart/api';
import { useSession } from '../../auth/SessionProvider';
import { useAsyncOperation } from '../../hooks/useAsyncOperation';
import { useBottomGuard } from '../../hooks/useBottomGuard';
import { useFormState } from '../../hooks/useFormState';
import { useAppLocation } from '../../location/AppLocationProvider';
import { useApi } from '../../lib/ApiProvider';
import { extractDeviceCoordinates } from '../../lib/coordinates';
import { toNullableString } from '../../lib/profileForm';
import { useNotifications } from '../../notifications/NotificationsProvider';
import { useTheme } from '../../theme';
import {
  ProfileIdentityFields,
  type ProfileIdentityFieldKey,
} from '../../ui/ProfileIdentityFields';
import { SettingsAccountActions } from '../../ui/SettingsAccountActions';
import { SettingsModalShell } from '../../ui/SettingsModalShell';
import { AppButton, Card, CardTitle } from '../../ui/primitives';
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

export default function UserSettings() {
  const api = useApi();
  const { colors } = useTheme();
  const { availableRoles, pickRole, logout } = useSession();
  const { unreadCount } = useNotifications();
  const { bottomGuardHeight, bottomContentPadding } = useBottomGuard();

  const {
    data: formData,
    patch,
    patchMany,
  } = useFormState<UserFormData>(initialFormData);

  const applyProfileData = useCallback(
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

  const fetchProfile = useCallback(async () => {
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
    <SettingsModalShell
      subtitle="Manage your settings and personal information"
      unreadCount={unreadCount}
      bottomGuardHeight={bottomGuardHeight}
      bottomContentPadding={bottomContentPadding}>
      <Card>
        <CardTitle title="User details" />

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

      <ThemeToggleCard />

      <SettingsAccountActions
        availableRoles={availableRoles}
        pickRole={pickRole}
        logout={logout}
      />
    </SettingsModalShell>
  );
}