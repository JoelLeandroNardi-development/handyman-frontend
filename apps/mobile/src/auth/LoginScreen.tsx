import React, { useMemo, useState } from "react";
import { ActivityIndicator, ImageBackground, ScrollView, Text, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Location from "expo-location";
import {
  getSkillsCatalogFlat,
  login,
  onboardingHandyman,
  onboardingUser,
  type SkillCatalogFlatResponse,
} from "@smart/api";
import { createApiClient, API_BASE_URL } from "../lib/api";
import { storeTokenPair } from "./session";
import { useSession } from "./SessionProvider";
import { AppButton, AppInput, Card, Label, MutedText, PageHeader, Screen } from "../ui/primitives";
import { BrandWordmark } from "../ui/BrandWordmark";
import { SkillCategorySections } from "../ui/SkillCategorySections";
import { APP_BACKGROUND_IMAGE, LOGIN_SCREEN_OVERLAY } from "../theme/appChrome";
import { useTheme } from "../theme";
import { toNullableString } from "../lib/profileForm";
import RegisterRolePicker from "./RegisterRolePicker";
import RegisterUserOnboardingForm from "./RegisterUserOnboardingForm";
import RegisterHandymanOnboardingForm from "./RegisterHandymanOnboardingForm";
import {
  initialRegisterOnboardingState,
  type RegisterOnboardingField,
  type RegisterRole,
} from "./registerTypes";

export default function LoginScreen() {
  const [step, setStep] = useState<"login" | "role" | "onboarding" | "handyman-skills">("login");
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("password");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [registerRole, setRegisterRole] = useState<RegisterRole | null>(null);
  const [status, setStatus] = useState("Not logged in");
  const [busy, setBusy] = useState(false);
  const [onboarding, setOnboarding] = useState(initialRegisterOnboardingState);
  const [skillsCatalog, setSkillsCatalog] = useState<SkillCatalogFlatResponse | null>(null);
  const [loadingSkillsCatalog, setLoadingSkillsCatalog] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const api = useMemo(() => createApiClient(), []);
  const { refresh } = useSession();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const maxCardHeight = Math.max(460, windowHeight - insets.top - insets.bottom - 48);

  const signupSteps: Array<{ key: "role" | "onboarding" | "handyman-skills" | "ready"; label: string }> =
    registerRole === "handyman"
      ? [
          { key: "role", label: "Let's start" },
          { key: "onboarding", label: "Your details" },
          { key: "handyman-skills", label: "Your skills" },
          { key: "ready", label: "Ready" },
        ]
      : [
          { key: "role", label: "Let's start" },
          { key: "onboarding", label: "Your details" },
          { key: "ready", label: "Ready" },
        ];

  const activeSignupStep =
    step === "role" ? "role" : step === "onboarding" ? "onboarding" : step === "handyman-skills" ? "handyman-skills" : null;

  const activeSignupIndex = activeSignupStep
    ? signupSteps.findIndex((item) => item.key === activeSignupStep)
    : -1;

  function updateOnboardingField(field: RegisterOnboardingField, value: string) {
    setOnboarding((prev) => ({ ...prev, [field]: value }));
  }

  function resetRegisterFlow() {
    setRegisterRole(null);
    setOnboarding(initialRegisterOnboardingState);
    setSkillsCatalog(null);
    setSelectedSkills([]);
    setConfirmPassword("");
  }

  function openSignUpFlow() {
    resetRegisterFlow();
    setStep("role");
    setStatus("Not logged in");
  }

  function selectRegisterRole(role: RegisterRole) {
    setRegisterRole(role);
    setStep("onboarding");
  }

  function changeAccountType() {
    setRegisterRole(null);
    setSkillsCatalog(null);
    setSelectedSkills([]);
    setStep("role");
  }

  function toggleSkill(skillKey: string) {
    setSelectedSkills((prev) =>
      prev.includes(skillKey) ? prev.filter((skill) => skill !== skillKey) : [...prev, skillKey]
    );
  }

  async function openHandymanSkillsStep() {
    setLoadingSkillsCatalog(true);

    try {
      const catalog = await getSkillsCatalogFlat(api, { active_only: true });
      setSkillsCatalog(catalog);
      setStep("handyman-skills");
    } catch (e) {
      setStatus(`Register failed: ${(e as Error).message}`);
    } finally {
      setLoadingSkillsCatalog(false);
    }
  }

  function backToLogin() {
    resetRegisterFlow();
    setStep("login");
    setStatus("Not logged in");
  }

  async function getDeviceCoordinates(): Promise<{ latitude: number | null; longitude: number | null }> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        return { latitude: null, longitude: null };
      }

      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      return {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      };
    } catch {
      return { latitude: null, longitude: null };
    }
  }

  async function onLogin() {
    setBusy(true);
    setStatus("Signing in…");

    try {
      const res = await login(api, { email, password });
      await storeTokenPair(res.access_token, res.refresh_token);
      await refresh();
      setStatus("Logged in.");
    } catch (e) {
      setStatus(`Login failed: ${(e as Error).message}`);
    } finally {
      setBusy(false);
    }
  }

  async function onRegister() {
    if (!registerRole) {
      setStatus("Register failed: choose user or handyman first.");
      return;
    }

    if (!email.trim() || !password.trim()) {
      setStatus("Register failed: email and password are required.");
      return;
    }

    if (password !== confirmPassword) {
      setStatus("Register failed: passwords do not match.");
      return;
    }

    setBusy(true);
    setStatus("Creating account…");

    try {
      const { latitude: parsedLatitude, longitude: parsedLongitude } = await getDeviceCoordinates();

      if (registerRole === "user") {
        await onboardingUser(api, {
          email,
          password,
          roles: ["user"],
          first_name: toNullableString(onboarding.firstName),
          last_name: toNullableString(onboarding.lastName),
          phone: toNullableString(onboarding.phone),
          national_id: toNullableString(onboarding.nationalId),
          address_line: toNullableString(onboarding.addressLine),
          postal_code: toNullableString(onboarding.postalCode),
          city: toNullableString(onboarding.city),
          country: toNullableString(onboarding.country),
          latitude: parsedLatitude,
          longitude: parsedLongitude,
        });
      } else {
        if (selectedSkills.length === 0) {
          throw new Error("Please add at least one skill for handyman onboarding.");
        }

        const parsedYears = Number.parseInt(onboarding.yearsExperience, 10);
        if (Number.isNaN(parsedYears) || parsedYears < 0) {
          throw new Error("Years of experience must be a non-negative integer.");
        }

        const parsedServiceRadius = Number.parseInt(onboarding.serviceRadiusKm, 10);
        if (Number.isNaN(parsedServiceRadius) || parsedServiceRadius < 0) {
          throw new Error("Service radius must be a non-negative integer.");
        }

        await onboardingHandyman(api, {
          email,
          password,
          roles: ["handyman"],
          first_name: toNullableString(onboarding.firstName),
          last_name: toNullableString(onboarding.lastName),
          phone: toNullableString(onboarding.phone),
          national_id: toNullableString(onboarding.nationalId),
          address_line: toNullableString(onboarding.addressLine),
          postal_code: toNullableString(onboarding.postalCode),
          city: toNullableString(onboarding.city),
          country: toNullableString(onboarding.country),
          latitude: parsedLatitude,
          longitude: parsedLongitude,
          skills: selectedSkills,
          years_experience: parsedYears,
          service_radius_km: parsedServiceRadius,
        });
      }

      setStatus("Account created. Signing in…");
      const res = await login(api, { email, password });
      await storeTokenPair(res.access_token, res.refresh_token);
      await refresh();
      setStatus("Registered and logged in.");
    } catch (e) {
      setStatus(`Register failed: ${(e as Error).message}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen style={{ backgroundColor: "transparent" }}>
      <ImageBackground
        source={APP_BACKGROUND_IMAGE}
        resizeMode="cover"
        style={{ flex: 1 }}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            backgroundColor: LOGIN_SCREEN_OVERLAY,
            paddingTop: 16,
            paddingHorizontal: 16,
            paddingBottom: Math.max(insets.bottom + 16, 24),
          }}>
          <Card
            style={{
              padding: 20,
              maxHeight: maxCardHeight,
              backgroundColor: colors.surfaceElevatedMuted,
            }}>
            <PageHeader
              title={<BrandWordmark />}
              subtitle={
                step === "login"
                  ? "Ready to get your home tasks done by someone else?"
                  : step === "role"
                    ? "Here to find a handyman or offer your services? Let's start with choosing your account type."
                    : step === "handyman-skills"
                      ? "Choose the skills you want to offer."
                      : registerRole
                        ? "Tell us a bit about yourself to get your account ready."
                        : "Create account"
              }
            />

            {step !== "login" ? (
              <View style={{ flexDirection: "row", gap: 8, marginBottom: 14 }}>
                {signupSteps.map((item, index) => {
                  const isActive = index === activeSignupIndex;
                  const isDone = index < activeSignupIndex;

                  return (
                    <View
                      key={item.key}
                      style={{
                        flex: 1,
                        borderWidth: 1,
                        borderColor: isActive || isDone ? colors.primary : colors.border,
                        backgroundColor: isActive || isDone ? colors.primarySoft : colors.surface,
                        borderRadius: 999,
                        paddingVertical: 7,
                        alignItems: "center",
                      }}>
                      <Text
                        style={{
                          color: isActive || isDone ? colors.primary : colors.textSoft,
                          fontSize: 12,
                          fontWeight: "800",
                        }}>
                        {item.label}
                      </Text>
                    </View>
                  );
                })}
              </View>
            ) : null}

            <ScrollView
              style={{ flexGrow: 0 }}
              contentContainerStyle={{ gap: 16, paddingBottom: 8 }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled">
              {step === "login" ? (
                <Text style={{ color: colors.textSoft, fontSize: 14, marginBottom: 4 }}>
                  Sign in to find trusted handymen nearby, or create an account if you are new here.
                </Text>
              ) : null}

              {step === "login" ? (
                <>
                  <View style={{ gap: 8 }}>
                    <Label>Email</Label>
                    <AppInput value={email} onChangeText={setEmail} autoCapitalize="none" autoCorrect={false} />
                  </View>

                  <View style={{ gap: 8 }}>
                    <Label>Password</Label>
                    <AppInput value={password} onChangeText={setPassword} secureTextEntry />
                  </View>

                  <Text
                    style={{
                      color: status.startsWith("Login failed") || status.startsWith("Register failed") ? colors.danger : colors.textSoft,
                      fontSize: 14,
                    }}>
                    {status === "Not logged in" ? null : status}
                  </Text>

                  <AppButton label="Login" onPress={onLogin} loading={busy} />

                  <AppButton
                    tone="surface"
                    label="I am new here, let's sign up!"
                    onPress={openSignUpFlow}
                    disabled={busy}
                  />
                </>
              ) : null}

              {step === "role" ? (
                <>
                  <RegisterRolePicker
                    onSelectUser={() => selectRegisterRole("user")}
                    onSelectHandyman={() => selectRegisterRole("handyman")}
                  />

                  <AppButton tone="surface" label="Back to login" onPress={backToLogin} disabled={busy} />
                </>
              ) : null}

              {step === "onboarding" ? (
                <>
                  <View style={{ gap: 8 }}>
                    <Label>Email</Label>
                    <AppInput value={email} onChangeText={setEmail} autoCapitalize="none" autoCorrect={false} />
                  </View>

                  <View style={{ gap: 8 }}>
                    <Label>Password</Label>
                    <AppInput value={password} onChangeText={setPassword} secureTextEntry />
                  </View>

                  <View style={{ gap: 8 }}>
                    <Label>Confirm password</Label>
                    <AppInput value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />
                  </View>

                  {registerRole === "user" ? (
                    <RegisterUserOnboardingForm values={onboarding} onChange={updateOnboardingField} />
                  ) : (
                    <RegisterHandymanOnboardingForm values={onboarding} onChange={updateOnboardingField} />
                  )}

                  <AppButton
                    label={registerRole === "handyman" ? "Next: Your skills" : "Create account"}
                    onPress={registerRole === "handyman" ? openHandymanSkillsStep : onRegister}
                    loading={busy || (registerRole === "handyman" && loadingSkillsCatalog)}
                    disabled={!registerRole}
                  />

                  <AppButton
                    label="Change account type"
                    tone="surface"
                    onPress={changeAccountType}
                    disabled={busy}
                  />

                  <AppButton tone="surface" label="Back to login" onPress={backToLogin} disabled={busy} />
                </>
              ) : null}

              {step === "handyman-skills" ? (
                <>
                  <Text style={{ color: colors.textSoft, fontSize: 14 }}>
                    Select one or more skills to personalize your handyman profile.
                  </Text>

                  {loadingSkillsCatalog ? (
                    <ActivityIndicator color={colors.primary} />
                  ) : !skillsCatalog || skillsCatalog.categories.length === 0 ? (
                    <Text style={{ color: colors.textSoft }}>No active skills found in catalog.</Text>
                  ) : (
                    <>
                      <Text style={{ color: colors.text, fontWeight: "800", fontSize: 15 }}>
                        Selected skills: {selectedSkills.length}
                      </Text>
                      <Text style={{ color: colors.textSoft, fontSize: 13, lineHeight: 18 }}>
                        Choose the services you want to be discoverable for.
                      </Text>
                      <SkillCategorySections
                        categories={skillsCatalog.categories}
                        isSelected={(skillKey) => selectedSkills.includes(skillKey)}
                        onSkillPress={toggleSkill}
                      />
                    </>
                  )}

                  <AppButton
                    label="Create account"
                    onPress={onRegister}
                    loading={busy}
                    disabled={selectedSkills.length === 0 || loadingSkillsCatalog}
                  />

                  <AppButton
                    label="Back to details"
                    tone="surface"
                    onPress={() => setStep("onboarding")}
                    disabled={busy}
                  />

                  <AppButton
                    label="Change account type"
                    tone="surface"
                    onPress={changeAccountType}
                    disabled={busy}
                  />

                  <AppButton tone="surface" label="Back to login" onPress={backToLogin} disabled={busy} />
                </>
              ) : null}
            </ScrollView>
          </Card>
        </View>
      </ImageBackground>
    </Screen>
  );
}