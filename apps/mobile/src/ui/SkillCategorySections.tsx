import React from 'react';
import type { SkillCatalogFlatResponse } from '@smart/api';
import { Text, View } from 'react-native';
import { useTheme } from '../theme';
import { getSkillImageSource } from './skillImageSources';
import { SkillSelectionTile } from './SkillSelectionTile';

interface SkillCategorySectionsProps {
  categories: SkillCatalogFlatResponse['categories'];
  isSelected: (skillKey: string) => boolean;
  onSkillPress: (skillKey: string) => void;
}

export function SkillCategorySections({
  categories,
  isSelected,
  onSkillPress,
}: SkillCategorySectionsProps) {
  const { colors } = useTheme();

  return (
    <>
      {categories.map(category => {
        const skillsInCategory = category.skills.filter(skill => skill.active);
        if (skillsInCategory.length === 0) {
          return null;
        }

        return (
          <View key={category.key} style={{ gap: 10 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: '800',
                color: colors.text,
              }}>
              {category.label}
            </Text>

            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: 'flex-start',
                gap: 8,
              }}>
              {skillsInCategory.map(skill => (
                <SkillSelectionTile
                  key={skill.key}
                  label={skill.label}
                  backgroundImage={getSkillImageSource(skill.key)}
                  selected={isSelected(skill.key)}
                  onPress={() => onSkillPress(skill.key)}
                />
              ))}
            </View>
          </View>
        );
      })}
    </>
  );
}