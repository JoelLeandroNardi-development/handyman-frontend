import React from 'react';
import {
  ImageBackground,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  View,
  type ImageSourcePropType,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { MAIN_APP_SCREEN_OVERLAY } from '../theme/appChrome';
import { useTheme } from '../theme';
import { useStyles } from './useStyles';

function getAndroidTopInset() {
  return Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0;
}

export function Screen({
  children,
  scroll = false,
  contentContainerStyle,
  style,
  backgroundImage,
  backgroundOverlayColor,
}: {
  children: React.ReactNode;
  scroll?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
  backgroundImage?: ImageSourcePropType;
  backgroundOverlayColor?: string;
}) {
  const { tokens } = useTheme();
  const styles = useStyles();
  const topInset = getAndroidTopInset();

  const content = scroll ? (
    <ScrollView
      contentContainerStyle={[
        {
          padding: tokens.spacing.lg,
          paddingBottom: tokens.spacing.xxl,
          gap: tokens.spacing.lg,
        },
        contentContainerStyle,
      ]}
      keyboardShouldPersistTaps="handled">
      {children}
    </ScrollView>
  ) : (
    children
  );

  const shell = (
    <>
      <View
        pointerEvents="none"
        style={[styles.screen.backgroundGradient, { top: topInset }]}
      />
      {content}
    </>
  );

  const wrappedContent = backgroundImage ? (
    <ImageBackground source={backgroundImage} resizeMode="cover" style={{ flex: 1 }}>
      <View
        style={{
          flex: 1,
          backgroundColor: backgroundOverlayColor ?? MAIN_APP_SCREEN_OVERLAY,
        }}>
        {shell}
      </View>
    </ImageBackground>
  ) : (
    shell
  );

  return (
    <View style={[styles.screen.base, { paddingTop: topInset }, style]}>
      {wrappedContent}
    </View>
  );
}

export function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const styles = useStyles();

  return <View style={[styles.card, style]}>{children}</View>;
}

export function CardTitle({
  title,
  action,
}: {
  title: string;
  action?: React.ReactNode;
}) {
  const { tokens } = useTheme();
  const styles = useStyles();

  return (
    <View style={[styles.rowSpaceBetween, { gap: tokens.spacing.md }]}>
      <Text style={[styles.titleText, { flex: 1 }]}>{title}</Text>
      {action}
    </View>
  );
}

export function EmptyState({ text }: { text: string }) {
  const styles = useStyles();
  return (
    <View style={[styles.card, { padding: 16 }]}>
      <Text style={styles.mutedText}>{text}</Text>
    </View>
  );
}

export function BottomSheet({
  visible,
  onClose,
  title,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  const { tokens } = useTheme();
  const styles = useStyles();

  if (!visible) return null;

  return (
    <View style={styles.modalOverlay}>
      <Pressable style={{ flex: 1 }} onPress={onClose} />
      <View
        style={[
          styles.bottomSheet,
          {
            borderTopLeftRadius: tokens.nativeRadius.lg,
            borderTopRightRadius: tokens.nativeRadius.lg,
          },
        ]}>
        {title ? <Text style={styles.titleText}>{title}</Text> : null}
        {children}
      </View>
    </View>
  );
}
