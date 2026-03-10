import React from "react";
import { SafeAreaView, Text, View } from "react-native";
import { useTheme } from "../../theme";

export default function FindPlaceholder() {
  const { colors } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, padding: 16, backgroundColor: colors.bg }}>
      <Text style={{ fontSize: 20, fontWeight: "700", color: colors.text }}>Find (Map-first)</Text>
      <View style={{ marginTop: 10 }}>
        <Text style={{ color: colors.textSoft }}>Next step: OSM map + bottom sheet + POST /match.</Text>
      </View>
    </SafeAreaView>
  );
}