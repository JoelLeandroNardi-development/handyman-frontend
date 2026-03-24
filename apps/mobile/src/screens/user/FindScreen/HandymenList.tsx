import React from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import type { MatchResult } from "@smart/api";
import { useTheme } from "../../../theme";
import { Card } from "../../../ui/primitives";
import { HandymanMatchCard } from "./HandymanMatchCard";

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

  const showPrompt = !userCoords;
  const showLoading = !!userCoords && loadingMatch;
  const showEmpty = !!userCoords && !loadingMatch && results.length === 0;
  const showResults = !!userCoords && !loadingMatch && results.length > 0;

  return (
    <Card>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "baseline",
        }}
      >
        <Text style={{ fontWeight: "800", color: colors.text, fontSize: 18 }}>
          Top matches
        </Text>
        <Text style={{ color: colors.textFaint }}>{results.length} results</Text>
      </View>

      {showPrompt ? (
        <Text style={{ marginTop: 10, color: colors.textSoft }}>
          Tap "Use my location" to start.
        </Text>
      ) : null}

      {showLoading ? (
        <View style={{ marginTop: 12 }}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : null}

      {showEmpty ? (
        <Text style={{ marginTop: 10, color: colors.textSoft }}>
          No results yet. Tap Match.
        </Text>
      ) : null}

      {showResults ? (
        <FlatList
          scrollEnabled={false}
          style={{ marginTop: 10 }}
          data={results}
          keyExtractor={(item) => item.email}
          renderItem={({ item }) => (
            <View style={{ marginBottom: 10 }}>
              <HandymanMatchCard
                item={item}
                selected={item.email === selectedEmail}
                onPress={() => onHandymanSelected(item.email)}
              />
            </View>
          )}
          ItemSeparatorComponent={() => <View style={{ height: 0 }} />}
        />
      ) : null}
    </Card>
  );
}