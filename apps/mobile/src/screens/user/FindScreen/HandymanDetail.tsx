import React from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import type { HandymanResponse, MatchResult } from "@smart/api";
import { useTheme } from "../../../theme";
import { AppButton, BottomSheet } from "../../../ui/primitives";
import { renderStars } from "./utils";

export interface HandymanDetailProps {
  open: boolean;
  selected: MatchResult | null;
  handymanProfile: HandymanResponse | null;
  profileLoading: boolean;
  onClose: () => void;
  onBookingRequested: () => void;
  bookingLoading?: boolean;
}

export function HandymanDetail({
  open,
  selected,
  handymanProfile,
  profileLoading,
  onClose,
  onBookingRequested,
  bookingLoading = false,
}: HandymanDetailProps) {
  const { colors } = useTheme();

  return (
    <BottomSheet visible={open} onClose={onClose} title="Handyman profile">
      {profileLoading ? (
        <View style={{ paddingVertical: 20, alignItems: "center" }}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : selected && handymanProfile ? (
        <ScrollView
          contentContainerStyle={{
            paddingBottom: 8,
            gap: 12,
          }}
          showsVerticalScrollIndicator={false}
        >
          <Text style={{ color: colors.textSoft }}>
            Handyman:{" "}
            {handymanProfile.first_name || handymanProfile.last_name
              ? `${handymanProfile.first_name ?? ""} ${handymanProfile.last_name ?? ""}`.trim()
              : handymanProfile.email}
          </Text>
          <Text style={{ color: colors.textSoft }}>Email: {handymanProfile.email}</Text>
          <Text style={{ color: colors.textSoft }}>
            Rating: {handymanProfile.avg_rating.toFixed(1)} / 5 ({handymanProfile.rating_count} reviews)
          </Text>
          <Text style={{ color: colors.textSoft }}>
            Stars: {renderStars(Math.round(handymanProfile.avg_rating))}
          </Text>
          <Text style={{ color: colors.textSoft }}>Distance: {selected.distance_km.toFixed(1)} km</Text>
          <Text style={{ color: colors.textSoft }}>Experience: {handymanProfile.years_experience} yrs</Text>
          <Text style={{ color: colors.textSoft }}>
            Service radius: {handymanProfile.service_radius_km} km
          </Text>
          <Text style={{ color: colors.textSoft }}>
            Availability: {selected.availability_unknown ? "Unknown" : "Known"}
          </Text>
          <Text style={{ color: colors.textSoft }}>
            Skills: {handymanProfile.skills.join(", ") || "-"}
          </Text>

          <AppButton
            label="Request booking"
            onPress={onBookingRequested}
            loading={bookingLoading}
          />
        </ScrollView>
      ) : null}
    </BottomSheet>
  );
}
