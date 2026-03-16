import React, { useMemo } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { WebView } from "react-native-webview";
import type { MatchResult } from "@smart/api";
import { useTheme } from "../../../theme";
import { Card } from "../../../ui/primitives";
import { buildMapHtml, type Coords } from "./utils";

export interface MapResultsProps {
  userCoords: Coords | null;
  results: MatchResult[];
}

export function MapResults({ userCoords, results }: MapResultsProps) {
  const { colors } = useTheme();
  const mapHtml = useMemo(() => buildMapHtml(userCoords, results), [userCoords, results]);

  return (
    <Card>
      <View style={{ marginBottom: 10 }}>
        <Text style={{ fontWeight: "800", color: colors.text, fontSize: 16 }}>Map</Text>
        <Text style={{ color: colors.textSoft, marginTop: 4 }}>
          Nearby results will appear here after matching.
        </Text>
      </View>

      <View
        style={{
          height: 380,
          borderRadius: 20,
          overflow: "hidden",
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.surface,
        }}
      >
        <WebView
          originWhitelist={["*"]}
          source={{ html: mapHtml }}
          javaScriptEnabled
          domStorageEnabled
          startInLoadingState
          renderLoading={() => (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
              <ActivityIndicator color={colors.primary} />
            </View>
          )}
        />
      </View>
    </Card>
  );
}
