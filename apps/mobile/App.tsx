import "./polyfills";

import React, { useMemo, useState } from "react";
import { SafeAreaView, Text, TextInput, Button, View } from "react-native";
import * as SecureStore from "expo-secure-store";

import { ApiClient, login } from "@smart/api";
import { decodeJwt } from "@smart/core";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://10.0.2.2:8000";

export default function App() {
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("password");
  const [status, setStatus] = useState<string>("Not logged in");

  const api = useMemo(() => {
    return new ApiClient(API_BASE_URL, async () => SecureStore.getItemAsync("token"));
  }, []);

  async function onLogin() {
    try {
      const res = await login(api, { email, password });
      await SecureStore.setItemAsync("token", res.access_token);

      const claims = decodeJwt(res.access_token);
      setStatus(`Logged in. roles=${JSON.stringify(claims.roles ?? [])}`);
    } catch (e) {
      setStatus(`Login failed: ${(e as Error).message}`);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: "600", marginBottom: 12 }}>Mobile (Expo)</Text>

      <View style={{ gap: 8, marginBottom: 12 }}>
        <Text>Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          style={{ borderWidth: 1, padding: 10 }}
        />

        <Text>Password</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={{ borderWidth: 1, padding: 10 }}
        />
      </View>

      <Button title="Login" onPress={onLogin} />

      <Text style={{ marginTop: 12 }}>{status}</Text>
      <Text style={{ marginTop: 8, opacity: 0.7 }}>API: {API_BASE_URL}</Text>
    </SafeAreaView>
  );
}