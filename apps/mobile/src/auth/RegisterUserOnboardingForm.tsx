import React from "react";
import { Text, View } from "react-native";
import { AppInput, Label } from "../ui/primitives";
import { useTheme } from "../theme";
import type { RegisterOnboardingField, RegisterOnboardingState } from "./registerTypes";

export default function RegisterUserOnboardingForm({
  values,
  onChange,
}: {
  values: RegisterOnboardingState;
  onChange: (field: RegisterOnboardingField, value: string) => void;
}) {
  const { colors } = useTheme();

  return (
    <>
      <Text style={{ color: colors.textSoft, fontSize: 14 }}>
        Personal details
      </Text>

      <View style={{ gap: 8 }}>
        <Label>First name</Label>
        <AppInput
          value={values.firstName}
          onChangeText={(value) => onChange("firstName", value)}
          placeholder="John"
        />
      </View>

      <View style={{ gap: 8 }}>
        <Label>Last name</Label>
        <AppInput
          value={values.lastName}
          onChangeText={(value) => onChange("lastName", value)}
          placeholder="Doe"
        />
      </View>

      <View style={{ gap: 8 }}>
        <Label>Phone</Label>
        <AppInput
          value={values.phone}
          onChangeText={(value) => onChange("phone", value)}
          keyboardType="phone-pad"
          placeholder="+351 900 000 000"
        />
      </View>

      <View style={{ gap: 8 }}>
        <Label>National ID</Label>
        <AppInput
          value={values.nationalId}
          onChangeText={(value) => onChange("nationalId", value)}
          placeholder="Optional"
        />
      </View>

      <Text style={{ color: colors.textSoft, fontSize: 14, marginTop: 6 }}>
        Address details
      </Text>

      <View style={{ gap: 8 }}>
        <Label>Address line</Label>
        <AppInput
          value={values.addressLine}
          onChangeText={(value) => onChange("addressLine", value)}
          placeholder="Street and number"
        />
      </View>

      <View style={{ gap: 8 }}>
        <Label>Postal code</Label>
        <AppInput
          value={values.postalCode}
          onChangeText={(value) => onChange("postalCode", value)}
          placeholder="1000-000"
        />
      </View>

      <View style={{ gap: 8 }}>
        <Label>City</Label>
        <AppInput value={values.city} onChangeText={(value) => onChange("city", value)} placeholder="Lisbon" />
      </View>

      <View style={{ gap: 8 }}>
        <Label>Country</Label>
        <AppInput value={values.country} onChangeText={(value) => onChange("country", value)} placeholder="Portugal" />
      </View>
    </>
  );
}
