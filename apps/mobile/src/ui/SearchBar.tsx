import React from 'react';
import { TextInput, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../theme';
import { useStyles } from './useStyles';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search by name, city...',
}: SearchBarProps) {
  const { tokens } = useTheme();
  const styles = useStyles();

  return (
    <View
      style={[
        styles.searchBar,
        {
          borderRadius: tokens.nativeRadius.sm,
          paddingHorizontal: tokens.spacing.sm,
          paddingVertical: tokens.spacing.xs,
        },
      ]}>
      <MaterialIcons
        name="search"
        size={styles.iconSize.small}
        color={tokens.colors.textFaint}
      />
      <TextInput
        style={{
          flex: 1,
          marginLeft: tokens.spacing.xs,
          paddingVertical: 0,
          color: tokens.colors.text,
          fontSize: tokens.typography.body.size,
        }}
        placeholder={placeholder}
        placeholderTextColor={tokens.colors.textFaint}
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
}
