import React from "react";
import { Pressable, Text, View } from "react-native";
import type { MatchResult } from "@smart/api";
import { useTheme } from "../../../theme";
import { StatusBadge } from "../../../ui/primitives";

export type TrustBadge = {
  label: string;
  tone: "success" | "warning" | "info" | "neutral";
};

export function deriveTrustBadge(item: MatchResult): TrustBadge | null {
  if (item.avg_rating >= 4.5 && item.rating_count >= 5) {
    return { label: "Top rated", tone: "success" };
  }
  if (item.rating_count >= 20) {
    return { label: "Highly reviewed", tone: "info" };
  }
  if (item.completed_jobs_count >= 30) {
    return { label: "Proven pro", tone: "success" };
  }
  if ((item.years_experience ?? 0) >= 5) {
    return { label: "Experienced", tone: "info" };
  }
  if ((item.profile_completeness ?? 0) >= 80) {
    return { label: "Complete profile", tone: "neutral" };
  }
  return null;
}

export interface HandymanMatchCardProps {
  item: MatchResult;
  selected: boolean;
  onPress: () => void;
}

export function HandymanMatchCard({
  item,
  selected,
  onPress,
}: HandymanMatchCardProps) {
  const { colors, tokens } = useTheme();
  const badge = deriveTrustBadge(item);

  const hasRating = (item.rating_count ?? 0) > 0;
  const hasJobs = (item.completed_jobs_count ?? 0) > 0;

  const distanceText =
    typeof item.distance_km === "number" ? `${item.distance_km.toFixed(1)} km` : null;

  const years =
    typeof item.years_experience === "number" ? item.years_experience : null;

  const yearsText =
    years !== null
      ? `${years} ${years === 1 ? "yr" : "yrs"} experience`
      : "Experience not specified";

  return (
    <Pressable
      onPress={onPress}
      style={{
        borderRadius: tokens.nativeRadius.lg,
        borderWidth: selected ? 2 : 1,
        borderColor: selected ? colors.primary : colors.border,
        backgroundColor: selected ? colors.primarySoft : colors.surface,
        padding: 14,
        gap: 6,
        ...tokens.nativeShadow.sm,
      }}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      <Text
        style={{
          fontSize: tokens.typography.subtitle.size,
          fontWeight: "800",
          color: colors.text,
        }}
        numberOfLines={1}
      >
        {item.email}
      </Text>

      <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
        {distanceText ? (
          <Text style={{ color: colors.textSoft, fontSize: tokens.typography.body.size }}>
            📍 {distanceText}
          </Text>
        ) : null}

        {distanceText ? (
          <Text style={{ color: colors.textFaint, fontSize: tokens.typography.body.size }}>
            •
          </Text>
        ) : null}

        <Text style={{ color: colors.textSoft, fontSize: tokens.typography.body.size }}>
          {yearsText}
        </Text>
      </View>

      {hasRating ? (
        <Text style={{ color: colors.textSoft, fontSize: tokens.typography.body.size }}>
          ⭐ {item.avg_rating.toFixed(1)} ({item.rating_count}{" "}
          {item.rating_count === 1 ? "review" : "reviews"})
        </Text>
      ) : (
        <Text style={{ color: colors.textFaint, fontSize: tokens.typography.bodySmall.size }}>
          No reviews yet
        </Text>
      )}

      {hasJobs ? (
        <Text style={{ color: colors.textSoft, fontSize: tokens.typography.body.size }}>
          {item.completed_jobs_count}{" "}
          {item.completed_jobs_count === 1 ? "job" : "jobs"} completed
        </Text>
      ) : (
        <Text style={{ color: colors.textFaint, fontSize: tokens.typography.bodySmall.size }}>
          New on platform
        </Text>
      )}

      {(badge || item.availability_unknown) && (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 2 }}>
          {badge ? <StatusBadge label={badge.label} tone={badge.tone} /> : null}
          {item.availability_unknown ? (
            <StatusBadge label="Availability unknown" tone="warning" />
          ) : null}
        </View>
      )}
    </Pressable>
  );
}