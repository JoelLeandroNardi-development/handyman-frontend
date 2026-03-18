import React from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import type { HandymanResponse, MatchResult } from "@smart/api";
import { useTheme } from "../../../theme";
import { AppButton, BottomSheet, StatusBadge } from "../../../ui/primitives";
import { renderStars } from "./utils";

function formatSkillLabel(skillKey: string) {
  return skillKey
    .split("_")
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

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
  const normalizedName = handymanProfile
    ? handymanProfile.first_name || handymanProfile.last_name
      ? `${handymanProfile.first_name ?? ""} ${handymanProfile.last_name ?? ""}`.trim()
      : handymanProfile.email
    : '';

  return (
    <BottomSheet visible={open} onClose={onClose} title="Handyman profile">
      {profileLoading ? (
        <View style={{ paddingVertical: 20, alignItems: "center" }}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : selected && handymanProfile ? (
        <ScrollView
          style={{ maxHeight: 520 }}
          contentContainerStyle={{
            paddingBottom: 8,
            gap: 14,
          }}
          showsVerticalScrollIndicator={false}
        >
          <View
            style={{
              borderRadius: 18,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.surfaceMuted,
              padding: 14,
              gap: 12,
            }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: 12,
              }}>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={{ fontSize: 22, fontWeight: '800', color: colors.text }}>
                  {normalizedName}
                </Text>
                <Text style={{ color: colors.textSoft }}>{handymanProfile.email}</Text>
              </View>

              <StatusBadge
                label={selected.availability_unknown ? 'Availability unknown' : 'Available'}
                tone={selected.availability_unknown ? 'warning' : 'success'}
              />
            </View>

            <Text style={{ color: colors.textSoft }}>
              {handymanProfile.avg_rating.toFixed(1)} / 5 • {handymanProfile.rating_count} reviews • {renderStars(Math.round(handymanProfile.avg_rating))}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View
              style={{
                flex: 1,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.surface,
                padding: 12,
                gap: 4,
              }}>
              <Text style={{ color: colors.textFaint, fontSize: 12, fontWeight: '700', textTransform: 'uppercase' }}>
                Distance
              </Text>
              <Text style={{ color: colors.textSoft, fontSize: 16 }}>
                {selected.distance_km.toFixed(1)} km
              </Text>
            </View>

            <View
              style={{
                flex: 1,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.surface,
                padding: 12,
                gap: 4,
              }}>
              <Text style={{ color: colors.textFaint, fontSize: 12, fontWeight: '700', textTransform: 'uppercase' }}>
                Experience
              </Text>
              <Text style={{ color: colors.textSoft, fontSize: 16 }}>
                {handymanProfile.years_experience} yrs
              </Text>
            </View>
          </View>

          <View
            style={{
              borderRadius: 18,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.surface,
              padding: 14,
              gap: 12,
            }}>
            <View style={{ gap: 4 }}>
              <Text style={{ color: colors.textFaint, fontSize: 12, fontWeight: '700', textTransform: 'uppercase' }}>
                Service radius
              </Text>
              <Text style={{ color: colors.textSoft, fontSize: 16 }}>
                {handymanProfile.service_radius_km} km
              </Text>
            </View>

            <View style={{ gap: 8 }}>
              <Text style={{ color: colors.textFaint, fontSize: 12, fontWeight: '700', textTransform: 'uppercase' }}>
                Skills
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {handymanProfile.skills.length > 0 ? (
                  handymanProfile.skills.map(skill => (
                    <View
                      key={skill}
                      style={{
                        borderRadius: 999,
                        borderWidth: 1,
                        borderColor: colors.border,
                        backgroundColor: colors.surfaceMuted,
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                      }}>
                      <Text style={{ color: colors.textSoft, fontWeight: '700' }}>
                        {formatSkillLabel(skill)}
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text style={{ color: colors.textSoft }}>No skills listed.</Text>
                )}
              </View>
            </View>
          </View>

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
