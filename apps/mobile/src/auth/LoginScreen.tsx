import React, { useMemo, useState } from "react";
import { SafeAreaView, Text, TextInput, Button, View } from "react-native";
import { login } from "@smart/api";
import { createApiClient, API_BASE_URL } from "../lib/api";
import { storeToken } from "./session";

export default function LoginScreen({ onLoggedIn }: { onLoggedIn: () => void }) {
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("password");
  const [status, setStatus] = useState<string>("Not logged in");

  const api = useMemo(() => createApiClient(), []);

  async function onLogin() {
    try {
      const res = await login(api, { email, password });
      await storeToken(res.access_token);
      setStatus("Logged in.");
      onLoggedIn();
    } catch (e) {
      setStatus(`Login failed: ${(e as Error).message}`);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: "700", marginBottom: 6 }}>Smart</Text>
      <Text style={{ opacity: 0.7, marginBottom: 14 }}>Sign in</Text>

      <View style={{ gap: 8, marginBottom: 12 }}>
        <Text>Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          style={{ borderWidth: 1, borderColor: "#ddd", borderRadius: 10, padding: 12 }}
        />

        <Text>Password</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={{ borderWidth: 1, borderColor: "#ddd", borderRadius: 10, padding: 12 }}
        />
      </View>

      <Button title="Login" onPress={onLogin} />
      <Text style={{ marginTop: 12 }}>{status}</Text>
      <Text style={{ marginTop: 8, opacity: 0.6 }}>API: {API_BASE_URL}</Text>
    </SafeAreaView>
  );
}