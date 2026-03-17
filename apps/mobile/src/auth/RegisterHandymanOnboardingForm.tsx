import React from "react";
import { Text, View } from "react-native";
import Slider from "@react-native-community/slider";
import { AppInput, Label } from "../ui/primitives";
import { useTheme } from "../theme";
import RegisterUserOnboardingForm from "./RegisterUserOnboardingForm";
import type { RegisterOnboardingField, RegisterOnboardingState } from "./registerTypes";

export default function RegisterHandymanOnboardingForm({
  values,
  onChange,
}: {
  values: RegisterOnboardingState;
  onChange: (field: RegisterOnboardingField, value: string) => void;
}) {
  const { colors } = useTheme();
  const radiusValue = Number.parseInt(values.serviceRadiusKm, 10);
  const sliderValue = Number.isNaN(radiusValue) ? 10 : radiusValue;

  return (
    <>
      <RegisterUserOnboardingForm values={values} onChange={onChange} />

      <View style={{ gap: 8 }}>
        <Label>Years of experience</Label>
        <AppInput
          value={values.yearsExperience}
          onChangeText={(value) => onChange("yearsExperience", value)}
          keyboardType="number-pad"
        />
      </View>

      <View style={{ gap: 8 }}>
        <Label>Service radius: {Math.round(sliderValue)} km</Label>
        <Slider
          minimumValue={0}
          maximumValue={100}
          step={1}
          value={sliderValue}
          onValueChange={(value) => onChange("serviceRadiusKm", String(Math.round(value)))}
          minimumTrackTintColor={colors.primary}
          maximumTrackTintColor={colors.border}
        />
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={{ color: colors.textFaint }}>0 km</Text>
          <Text style={{ color: colors.textFaint }}>100 km</Text>
        </View>
      </View>
    </>
  );
}
