import React, { useMemo, useState } from "react";
import { Text, View } from "react-native";
import { login } from "@smart/api";
import { createApiClient, API_BASE_URL } from "../lib/api";
import { storeToken } from "./session";
import { useSession } from "./SessionProvider";
import { AppButton, AppInput, Card, Label, MutedText, PageHeader, Screen } from "../ui/primitives";
import { useTheme } from "../theme";

export default function LoginScreen() {
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("password");
  const [status, setStatus] = useState("Not logged in");
  const [busy, setBusy] = useState(false);

  const api = useMemo(() => createApiClient(), []);
  const { refresh } = useSession();
  const { colors } = useTheme();

  async function onLogin() {
    setBusy(true);
    setStatus("Signing in…");

    try {
      const res = await login(api, { email, password });
      await storeToken(res.access_token);
      await refresh();
      setStatus("Logged in.");
    } catch (e) {
      setStatus(`Login failed: ${(e as Error).message}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen scroll contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}>
      <Card style={{ padding: 20 }}>
        <PageHeader title="Smart" subtitle="Sign in" />

        <View style={{ gap: 8 }}>
          <Label>Email</Label>
          <AppInput value={email} onChangeText={setEmail} autoCapitalize="none" autoCorrect={false} />
        </View>

        <View style={{ gap: 8 }}>
          <Label>Password</Label>
          <AppInput value={password} onChangeText={setPassword} secureTextEntry />
        </View>

        <AppButton label="Login" onPress={onLogin} loading={busy} />

        <Text
          style={{
            color: status.startsWith("Login failed") ? colors.danger : colors.textSoft,
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