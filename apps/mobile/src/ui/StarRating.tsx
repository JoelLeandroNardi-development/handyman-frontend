import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTheme } from '../theme';

export function StarRating({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}) {
  const { colors } = useTheme();

  return (
    <View style={{ flexDirection: 'row', gap: 8 }}>
      {[1, 2, 3, 4, 5].map(star => {
        const active = star <= value;

        return (
          <Pressable
            key={star}
            onPress={() => {
              if (!disabled) onChange(star);
            }}
            disabled={disabled}
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: active ? colors.primary : colors.border,
              backgroundColor: active ? colors.surfaceMuted : 'transparent',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: disabled ? 0.6 : 1,
            }}>
            <Text
              style={{
                fontSize: 24,
                color: active ? colors.primary : colors.textFaint,
              }}>
              ★
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
