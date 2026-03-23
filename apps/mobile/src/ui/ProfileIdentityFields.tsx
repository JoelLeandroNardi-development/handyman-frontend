import React from 'react';
import { View } from 'react-native';
import { AppInput, ButtonRow, Label } from './primitives';

export interface ProfileIdentityValues {
  firstName: string;
  lastName: string;
  phone: string;
  nationalId: string;
  addressLine: string;
  postalCode: string;
  city: string;
  country: string;
}

export type ProfileIdentityFieldKey = keyof ProfileIdentityValues;

interface ProfileIdentityFieldsProps {
  values: ProfileIdentityValues;
  onChange: (field: ProfileIdentityFieldKey, value: string) => void;
}

export function ProfileIdentityFields({
  values,
  onChange,
}: ProfileIdentityFieldsProps) {
  return (
    <>
      <View style={{ gap: 8 }}>
        <Label>First name</Label>
        <AppInput
          value={values.firstName}
          onChangeText={value => onChange('firstName', value)}
          placeholder="First name"
        />
      </View>

      <View style={{ gap: 8 }}>
        <Label>Last name</Label>
        <AppInput
          value={values.lastName}
          onChangeText={value => onChange('lastName', value)}
          placeholder="Last name"
        />
      </View>

      <View style={{ gap: 8 }}>
        <Label>Phone</Label>
        <AppInput
          value={values.phone}
          onChangeText={value => onChange('phone', value)}
          placeholder="Phone"
          keyboardType="phone-pad"
        />
      </View>

      <View style={{ gap: 8 }}>
        <Label>National ID</Label>
        <AppInput
          value={values.nationalId}
          onChangeText={value => onChange('nationalId', value)}
          placeholder="National ID"
        />
      </View>

      <View style={{ gap: 8 }}>
        <Label>Address line</Label>
        <AppInput
          value={values.addressLine}
          onChangeText={value => onChange('addressLine', value)}
          placeholder="Address line"
        />
      </View>

      <ButtonRow>
        <View style={{ flex: 1, gap: 8 }}>
          <Label>Postal code</Label>
          <AppInput
            value={values.postalCode}
            onChangeText={value => onChange('postalCode', value)}
            placeholder="Postal code"
          />
        </View>
        <View style={{ flex: 1, gap: 8 }}>
          <Label>City</Label>
          <AppInput
            value={values.city}
            onChangeText={value => onChange('city', value)}
            placeholder="City"
          />
        </View>
      </ButtonRow>

      <View style={{ gap: 8 }}>
        <Label>Country</Label>
        <AppInput
          value={values.country}
          onChangeText={value => onChange('country', value)}
          placeholder="Country"
        />
      </View>
    </>
  );
}