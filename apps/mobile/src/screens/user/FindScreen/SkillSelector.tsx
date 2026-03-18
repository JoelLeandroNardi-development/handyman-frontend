import React from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { SkillCatalogFlatResponse } from '@smart/api';
import { useTheme } from '../../../theme';
import { SkillCategorySections } from '../../../ui/SkillCategorySections';
import { useStyles } from '../../../ui/useStyles';

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
  const { mode, colors } = useTheme();
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const screenHeight = Dimensions.get('window').height;
  const maxSelectorHeight = Math.max(320, screenHeight - insets.top - 120);

  if (!open) {
    return null;
  }

  return (
    <View style={styles.modalOverlay}>
      <BlurView
        intensity={mode === 'dark' ? 28 : 36}
        tint={mode}
        style={StyleSheet.absoluteFillObject}
      />
      <Pressable style={{ flex: 1 }} onPress={onClose} />

      <View
        style={[
          styles.modalBase,
          {
            width: '100%',
            maxHeight: maxSelectorHeight,
            backgroundColor: colors.surface,
          },
        ]}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: 12,
            paddingHorizontal: 16,
            paddingTop: 10,
            paddingBottom: 10,
          }}>
          <View style={{ flex: 1, gap: 2 }}>
            <Text
              style={{
                color: colors.text,
                fontSize: 20,
                lineHeight: 26,
                fontWeight: '800',
              }}>
              Choose a skill
            </Text>
            <Text style={{ color: colors.textSoft, fontSize: 13, lineHeight: 18 }}>
              Pick one service category to drive your search.
            </Text>
          </View>

          <Pressable
            onPress={onClose}
            hitSlop={8}
            style={({ pressed }) => ({
              width: 36,
              height: 36,
              borderRadius: 18,
              borderWidth: 1,
              borderColor: colors.border,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: pressed ? colors.primarySoft : colors.surface,
            })}>
            <MaterialIcons name="close" size={18} color={colors.text} />
          </Pressable>
        </View>

        <View
          style={{
            borderTopWidth: 1,
            borderTopColor: colors.border,
            paddingHorizontal: 16,
            paddingTop: 14,
            paddingBottom: Math.max(insets.bottom + 18, 30),
          }}>
          <View style={{ gap: 12 }}>
            <ScrollView
              style={{ flexGrow: 0 }}
              contentContainerStyle={{ gap: 18, paddingBottom: 15 }}>
              <SkillCategorySections
                categories={catalog?.categories ?? []}
                isSelected={skillKey => selectedSkillKey === skillKey}
                onSkillPress={skillKey => {
                  onSkillSelected(skillKey);
                  onClose();
                }}
              />
            </ScrollView>
          </View>
        </View>
      </View>
    </View>
  );
}
