import React from "react";
import { SafeAreaView, Text, View } from "react-native";

export default function FindPlaceholder() {
  return (
    <SafeAreaView style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: "700" }}>Find (Map-first)</Text>
      <View style={{ marginTop: 10, opacity: 0.7 }}>
        <Text>Next step: OSM map + bottom sheet + POST /match.</Text>
      </View>
    </SafeAreaView>
  );
}