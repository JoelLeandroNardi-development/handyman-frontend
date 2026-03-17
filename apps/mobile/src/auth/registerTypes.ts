export type RegisterRole = "user" | "handyman";

export type RegisterOnboardingState = {
  firstName: string;
  lastName: string;
  phone: string;
  nationalId: string;
  addressLine: string;
  postalCode: string;
  city: string;
  country: string;
  yearsExperience: string;
  serviceRadiusKm: string;
};

export type RegisterOnboardingField = keyof RegisterOnboardingState;

export const initialRegisterOnboardingState: RegisterOnboardingState = {
  firstName: "",
  lastName: "",
  phone: "",
  nationalId: "",
  addressLine: "",
  postalCode: "",
  city: "",
  country: "",
  yearsExperience: "0",
  serviceRadiusKm: "10",
};
