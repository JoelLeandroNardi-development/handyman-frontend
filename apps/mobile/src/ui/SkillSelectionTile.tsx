import React from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import {
  type ImageSourcePropType,
  ImageBackground,
  Pressable,
  Text,
  View,
} from 'react-native';
import { useTheme } from '../theme';

interface SkillSelectionTileProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  backgroundImage?: ImageSourcePropType;
}

export function SkillSelectionTile({
  label,
  selected,
  onPress,
  backgroundImage,
}: SkillSelectionTileProps) {
  const { colors, tokens } = useTheme();

  const content = (
    <View
      style={{
        flex: 1,
        justifyContent: 'space-between',
        padding: tokens.spacing.md,
        backgroundColor: backgroundImage
          ? 'rgba(10, 15, 24, 0.38)'
          : selected
            ? colors.primarySoft
            : colors.surfaceMuted,
      }}>
      <View
        style={{
          alignSelf: 'flex-end',
          minWidth: 28,
          height: 28,
          paddingHorizontal: 8,
          borderRadius: 999,
          backgroundColor: selected ? colors.primary : colors.surface,
          borderWidth: 1,
          borderColor: selected ? colors.primary : colors.border,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <MaterialIcons
          name={selected ? 'check' : 'add'}
          size={16}
          color={selected ? '#fff' : colors.textFaint}
        />
      </View>

      <Text
        style={{
          color: backgroundImage ? '#fff' : colors.text,
          fontSize: 11,
          fontWeight: '800',
          lineHeight: 14,
        }}>
        {label}
      </Text>
    </View>
  );

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        width: '31.5%',
        aspectRatio: 1,
        borderRadius: tokens.nativeRadius.md,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: selected ? colors.primary : colors.border,
        backgroundColor: backgroundImage
          ? colors.surfaceMuted
          : selected
            ? colors.primarySoft
            : colors.surface,
        opacity: pressed ? 0.88 : 1,
      })}>
      {backgroundImage ? (
        <ImageBackground
          source={backgroundImage}
          resizeMode="cover"
          style={{ flex: 1 }}>
          {content}
        </ImageBackground>
      ) : (
        content
      )}
    </Pressable>
  );
}