import React, { useMemo, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
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
import { AppButton, AppInput, Card, Label, MutedText, PageHeader, Screen, SkillChip } from "../ui/primitives";
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

  const signupSteps: Array<{ key: "role" | "onboarding" | "handyman-skills"; label: string }> = [
    { key: "role", label: "Role" },
    { key: "onboarding", label: "Details" },
    { key: "handyman-skills", label: "Skills" },
  ];

  const activeSignupIndex =
    step === "role" ? 0 : step === "onboarding" ? 1 : step === "handyman-skills" ? 2 : -1;

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
    <Screen scroll contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}>
      <Card style={{ padding: 20 }}>
        <PageHeader
          title="Smart"
          subtitle={
            step === "login"
              ? "Sign in"
              : step === "role"
                ? "Choose your role"
                : step === "handyman-skills"
                  ? "Pick your skills"
                : registerRole
                  ? `Create ${registerRole} account`
                  : "Create account"
          }
        />

        {step !== "login" ? (
          <View style={{ flexDirection: "row", gap: 8, marginBottom: 6 }}>
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
                  }}
                >
                  <Text
                    style={{
                      color: isActive || isDone ? colors.primary : colors.textSoft,
                      fontSize: 12,
                      fontWeight: "800",
                    }}
                  >
                    {item.label}
                  </Text>
                </View>
              );
            })}
          </View>
        ) : (
          <Text style={{ color: colors.textSoft, fontSize: 14, marginBottom: 4 }}>
            Welcome back. Sign in to manage bookings, jobs, and notifications.
          </Text>
        )}

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

            <AppButton
              label="Login"
              onPress={onLogin}
              loading={busy}
            />

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

            <AppButton
              tone="surface"
              label="Back to login"
              onPress={backToLogin}
              disabled={busy}
            />
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
              label={registerRole === "handyman" ? "Next: Select skills" : "Create account"}
              onPress={registerRole === "handyman" ? openHandymanSkillsStep : onRegister}
              loading={busy || (registerRole === "handyman" && loadingSkillsCatalog)}
              disabled={!registerRole}
            />

            <AppButton
              label="Change account type"
              tone="surface"
              onPress={() => setStep("role")}
              disabled={busy}
            />

            <AppButton
              tone="surface"
              label="Back to login"
              onPress={backToLogin}
              disabled={busy}
            />
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
                {skillsCatalog.categories.map((category) => {
                  const activeSkills = category.skills.filter((skill) => skill.active);
                  if (activeSkills.length === 0) return null;

                  return (
                    <View key={category.key} style={{ gap: 10 }}>
                      <Text style={{ fontSize: 16, fontWeight: "800", color: colors.text }}>{category.label}</Text>
                      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                        {activeSkills.map((skill) => (
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
              onPress={() => setStep("role")}
              disabled={busy}
            />

            <AppButton
              tone="surface"
              label="Back to login"
              onPress={backToLogin}
              disabled={busy}
            />
          </>
        ) : null}

        <Text
          style={{
            color: status.startsWith("Login failed") || status.startsWith("Register failed") ? colors.danger : colors.textSoft,
            fontSize: 14,
          }}
        >
          {status}
        </Text>

        <MutedText>API: {API_BASE_URL}</MutedText>
      </Card>
    </Screen>
  );
}