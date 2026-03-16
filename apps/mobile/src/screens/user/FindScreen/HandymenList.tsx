import React from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import type { MatchResult } from "@smart/api";
import { useTheme } from "../../../theme";
import { AppButton, Card } from "../../../ui/primitives";

export interface HandymenListProps {
  results: MatchResult[];
  userCoords: { latitude: number; longitude: number } | null;
  loadingMatch: boolean;
  selectedEmail: string | null;
  onHandymanSelected: (email: string) => void;
}

export function HandymenList({
  results,
  userCoords,
  loadingMatch,
  selectedEmail,
  onHandymanSelected,
}: HandymenListProps) {
  const { colors } = useTheme();

  return (
    <Card>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" }}>
        <Text style={{ fontWeight: "800", color: colors.text, fontSize: 18 }}>Top matches</Text>
        <Text style={{ color: colors.textFaint }}>{results.length} results</Text>
      </View>

      {!userCoords ? (
        <Text style={{ marginTop: 10, color: colors.textSoft }}>Tap "Use my location" to start.</Text>
      ) : loadingMatch ? (
        <View style={{ marginTop: 12 }}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : results.length === 0 ? (
        <Text style={{ marginTop: 10, color: colors.textSoft }}>No results yet. Tap Match.</Text>
      ) : (
        <FlatList
          scrollEnabled={false}
          style={{ marginTop: 10 }}
          data={results}
          keyExtractor={(item) => item.email}
          renderItem={({ item }) => {
            const isSelected = item.email === selectedEmail;

            return (
              <View style={{ marginBottom: 8 }}>
                <AppButton
                  label={`${item.email} • ${item.distance_km.toFixed(1)} km • ${item.years_experience} yrs${
                    item.availability_unknown ? " • unknown availability" : ""
                  }`}
                  onPress={() => onHandymanSelected(item.email)}
                  tone={isSelected ? "primary" : "secondary"}
                />
              </View>
            );
          }}
        />
      )}
    </Card>
  );
}
