import React, { useMemo, useState } from "react";
import { SafeAreaView, Text, TextInput, Button, View } from "react-native";
import { login } from "@smart/api";
import { createApiClient, API_BASE_URL } from "../lib/api";
import { storeToken } from "./session";
import { useSession } from "./SessionProvider";

const styles = {
  root: { flex: 1, padding: 16 } as const,
  header: { fontSize: 22, fontWeight: "700", marginBottom: 6 } as const,
  subHeader: { opacity: 0.7, marginBottom: 14 } as const,
  section: { gap: 8, marginBottom: 12 } as const,
  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 10, padding: 12 } as const,
  status: { marginTop: 12 } as const,
  apiUrl: { marginTop: 8, opacity: 0.6 } as const,
};

export default function LoginScreen() {
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("password");
  const [status, setStatus] = useState<string>("Not logged in");
  const api = useMemo(() => createApiClient(), []);
  const { refresh } = useSession();

  async function onLogin() {
    try {
      const res = await login(api, { email, password });
      await storeToken(res.access_token);
      await refresh();
      setStatus("Logged in.");
    } catch (e) {
      setStatus(`Login failed: ${(e as Error).message}`);
    }
  }

  return (
    <SafeAreaView style={styles.root}>
      <Text style={styles.header}>Smart</Text>
      <Text style={styles.subHeader}>Sign in</Text>

      <View style={styles.section}>
        <Text>Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          style={styles.input}
        />

        <Text>Password</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />
      </View>

      <Button title="Login" onPress={onLogin} />
      <Text style={styles.status}>{status}</Text>
      <Text style={styles.apiUrl}>API: {API_BASE_URL}</Text>
    </SafeAreaView>
  );
}