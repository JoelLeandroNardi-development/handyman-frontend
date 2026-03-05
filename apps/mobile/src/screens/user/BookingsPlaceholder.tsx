import React from "react";
import { SafeAreaView, Text, View } from "react-native";

export default function BookingsPlaceholder() {
  return (
    <SafeAreaView style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: "700" }}>Bookings</Text>
      <View style={{ marginTop: 10, opacity: 0.7 }}>
        <Text>Next step: list bookings + cancel flow.</Text>
      </View>
    </SafeAreaView>
  );
}