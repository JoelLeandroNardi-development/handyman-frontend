import React from 'react';
import { BlurView } from 'expo-blur';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Dimensions, StyleSheet } from 'react-native';
import { useTheme } from '../theme';
import { useStyles } from './useStyles';

interface ModalScreenProps {
  children: React.ReactNode;
  scrollable?: boolean;
  contentContainerStyle?: any;
  style?: any;
}

export function ModalScreen({
  children,
  scrollable = true,
  contentContainerStyle,
  style,
}: ModalScreenProps) {
  const { mode, tokens } = useTheme();
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const screenHeight = Dimensions.get('window').height;

  const maxHeight = screenHeight - Math.max(insets.bottom);

  const modalStyle = [
    styles.modalBase,
    {
      maxHeight,
      height: scrollable ? undefined : maxHeight,
      width: '100%',
      backgroundColor: tokens.colors.surface,
    },
    style,
  ];

  if (scrollable) {
    return (
      <View style={styles.modalOverlay}>
        <BlurView
          intensity={mode === 'dark' ? 28 : 36}
          tint={mode}
          style={StyleSheet.absoluteFillObject}
        />
        <View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFillObject,
            {
              backgroundColor: tokens.colors.modalOverlay,
            },
          ]}
        />
        <View style={modalStyle}>
          <ScrollView
            contentContainerStyle={[
              {
                paddingHorizontal: tokens.spacing.lg,
                gap: tokens.spacing.md,
              },
              contentContainerStyle,
            ]}
            keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.modalOverlay}>
      <BlurView
        intensity={mode === 'dark' ? 28 : 36}
        tint={mode}
        style={StyleSheet.absoluteFillObject}
      />
      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFillObject,
          {
            backgroundColor: tokens.colors.modalOverlay,
          },
        ]}
      />
      <View style={modalStyle}>{children}</View>
    </View>
  );
}
