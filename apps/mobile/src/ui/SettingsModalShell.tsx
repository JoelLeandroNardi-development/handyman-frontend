import React from 'react';
import { ScrollView, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '../theme';
import { ModalScreen } from './ModalScreen';
import { ScreenHeader } from './ScreenHeader';

interface SettingsModalShellProps {
  subtitle: string;
  unreadCount: number;
  bottomGuardHeight: number;
  bottomContentPadding: number;
  children: React.ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
}

export function SettingsModalShell({
  subtitle,
  unreadCount,
  bottomGuardHeight,
  bottomContentPadding,
  children,
  contentStyle,
}: SettingsModalShellProps) {
  const { colors } = useTheme();

  return (
    <ModalScreen
      scrollable={false}
      style={{
        paddingBottom: 10,
      }}>
      <ScreenHeader
        title="Profile"
        subtitle={subtitle}
        notificationBadgeCount={unreadCount}
        isModal={true}
        modalVariant="compact"
        closeButtonPosition="right"
      />

      <View style={{ flex: 1, minHeight: 0 }}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[
            {
              paddingHorizontal: 16,
              gap: 14,
              paddingBottom: bottomContentPadding,
            },
            contentStyle,
          ]}>
          {children}
        </ScrollView>
        <View
          pointerEvents="none"
          style={{
            height: bottomGuardHeight,
            backgroundColor: colors.surface,
          }}
        />
      </View>
    </ModalScreen>
  );
}