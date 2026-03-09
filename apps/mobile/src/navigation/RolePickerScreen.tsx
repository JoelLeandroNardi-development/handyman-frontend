import React from "react";
import { SafeAreaView, Text, TouchableOpacity, View } from "react-native";
import { useSession } from "../auth/SessionProvider";

export default function RolePickerScreen() {
  const { pickRole } = useSession();

  return (
    <SafeAreaView style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 22, fontWeight: "700" }}>Choose mode</Text>
      <Text style={{ opacity: 0.7 }}>
        Your account supports both roles. Pick how you want to use the app right now.
      </Text>

      <View style={{ gap: 12, marginTop: 12 }}>
        <TouchableOpacity
          onPress={() => pickRole("user")}
          style={{
            backgroundColor: "#fff",
            borderWidth: 1,
            borderColor: "#e6e8ef",
            borderRadius: 14,
            padding: 14
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "700" }}>Continue as User</Text>
          <Text style={{ opacity: 0.7, marginTop: 6 }}>Find handymen, request bookings</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => pickRole("handyman")}
          style={{
            backgroundColor: "#fff",
            borderWidth: 1,
            borderColor: "#e6e8ef",
            borderRadius: 14,
            padding: 14
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "700" }}>Continue as Handyman</Text>
          <Text style={{ opacity: 0.7, marginTop: 6 }}>Manage jobs, confirm requests</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}