import React from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Dimensions } from 'react-native';
import { useTheme } from '../theme';
import { useStyles } from './useStyles';

interface ModalScreenProps {
  children: React.ReactNode;
  scrollable?: boolean;
  contentContainerStyle?: any;
  style?: any;
}

/**
 * Reusable modal screen component
 * Encapsulates consistent modal styling, sizing, and layout
 * Ensures all modals (Notifications, Profile, etc.) have identical structure
 *
 * SOLID Principle: Single Responsibility - only handles modal presentation
 * DRY Principle: Consolidates modal styling from 3 files into 1
 */
export function ModalScreen({
  children,
  scrollable = true,
  contentContainerStyle,
  style,
}: ModalScreenProps) {
  const { tokens } = useTheme();
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const screenHeight = Dimensions.get('window').height;

  // Reserve space for tab bar
  const maxHeight = screenHeight - Math.max(insets.bottom);

  const modalStyle = [
    styles.modalBase,
    {
      maxHeight,
      backgroundColor: tokens.colors.surface,
    },
    style,
  ];

  if (scrollable) {
    return (
      <View style={modalStyle}>
        <ScrollView
          contentContainerStyle={[
            {
              paddingHorizontal: tokens.spacing.lg,
              gap: tokens.spacing.md,
            },
            contentContainerStyle,
          ]}>
          {children}
        </ScrollView>
      </View>
    );
  }

  return <View style={modalStyle}>{children}</View>;
}
