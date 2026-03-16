import React from "react";
import { ScrollView, Text, View } from "react-native";
import type { SkillCatalogFlatResponse } from "@smart/api";
import { useTheme } from "../../../theme";
import { AppButton, BottomSheet } from "../../../ui/primitives";

export interface SkillSelectorProps {
  open: boolean;
  catalog: SkillCatalogFlatResponse | null;
  selectedSkillKey: string;
  onSkillSelected: (skillKey: string) => void;
  onClose: () => void;
}

export function SkillSelector({
  open,
  catalog,
  selectedSkillKey,
  onSkillSelected,
  onClose,
}: SkillSelectorProps) {
  const { colors } = useTheme();

  return (
    <BottomSheet visible={open} onClose={onClose} title="Choose a skill">
      <ScrollView>
        {catalog?.categories.map((category) => {
          const activeSkills = category.skills.filter((s) => s.active);
          if (activeSkills.length === 0) return null;

          return (
            <View key={category.key} style={{ marginBottom: 16, gap: 8 }}>
              <Text style={{ fontWeight: "800", color: colors.text, fontSize: 16 }}>{category.label}</Text>

              {activeSkills.map((skill) => {
                const isSelected = selectedSkillKey === skill.key;
                return (
                  <AppButton
                    key={skill.key}
                    label={skill.label}
                    onPress={() => {
                      onSkillSelected(skill.key);
                      onClose();
                    }}
                    tone={isSelected ? "primary" : "secondary"}
                  />
                );
              })}
            </View>
          );
        })}
      </ScrollView>

      <AppButton label="Close" onPress={onClose} tone="secondary" />
    </BottomSheet>
  );
}
