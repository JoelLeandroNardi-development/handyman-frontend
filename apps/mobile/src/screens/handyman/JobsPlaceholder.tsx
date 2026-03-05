import React from "react";
import { SafeAreaView, Text, View } from "react-native";

export default function JobsPlaceholder() {
  return (
    <SafeAreaView style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: "700" }}>Jobs</Text>
      <View style={{ marginTop: 10, opacity: 0.7 }}>
        <Text>Next step: incoming bookings + confirm/cancel.</Text>
      </View>
    </SafeAreaView>
  );
}