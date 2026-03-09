import React from "react";
import { SafeAreaView, Text, TouchableOpacity, View } from "react-native";
import { useSession } from "../../auth/SessionProvider";

export default function ProfilePlaceholder() {
  const { session, availableRoles, pickRole, roleMode, logout } = useSession();

  return (
    <SafeAreaView style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 20, fontWeight: "700" }}>Profile</Text>

      <View
        style={{
          backgroundColor: "#fff",
          borderWidth: 1,
          borderColor: "#e6e8ef",
          borderRadius: 14,
          padding: 14,
          gap: 6,
        }}
      >
        <Text style={{ fontWeight: "700" }}>{session?.email ?? "-"}</Text>
        <Text style={{ opacity: 0.7 }}>Current mode: {roleMode ?? "-"}</Text>
        <Text style={{ opacity: 0.7 }}>Roles: {(session?.roles ?? []).join(", ") || "-"}</Text>
        {session?.me.user_profile?.full_name ? (
          <Text style={{ opacity: 0.7 }}>Full name: {session.me.user_profile.full_name}</Text>
        ) : null}
      </View>

      {availableRoles.length > 1 ? (
        <View
          style={{
            backgroundColor: "#fff",
            borderWidth: 1,
            borderColor: "#e6e8ef",
            borderRadius: 14,
            padding: 14,
            gap: 10,
          }}
        >
          <Text style={{ fontWeight: "700" }}>Switch role</Text>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <TouchableOpacity
              onPress={() => pickRole("user")}
              style={{
                flex: 1,
                backgroundColor: "#e5e7eb",
                padding: 12,
                borderRadius: 12,
                alignItems: "center",
              }}
            >
              <Text>User</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => pickRole("handyman")}
              style={{
                flex: 1,
                backgroundColor: "#e5e7eb",
                padding: 12,
                borderRadius: 12,
                alignItems: "center",
              }}
            >
              <Text>Handyman</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}

      <TouchableOpacity
        onPress={logout}
        style={{
          backgroundColor: "#111827",
          padding: 12,
          borderRadius: 12,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "700" }}>Logout</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}