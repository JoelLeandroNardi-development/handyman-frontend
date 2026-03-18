import React from 'react';
import { Text, View } from 'react-native';
import { useNotifications } from '../notifications/NotificationsProvider';
import { useTheme } from '../theme';
import { AppButton, Card, Screen } from '../ui/primitives';
import { ScreenHeader } from '../ui/ScreenHeader';

export default function ChatPlaceholderScreen() {
  const { colors } = useTheme();
  const { unreadCount } = useNotifications();

  return (
    <Screen>
      <ScreenHeader
        title="Chat"
        subtitle="Conversations and message threads will live here."
        notificationBadgeCount={unreadCount}
      />

      <View style={{ paddingHorizontal: 16, paddingBottom: 28, gap: 14 }}>
        <Card>
          <View style={{ gap: 10 }}>
            <Text style={{ color: colors.text, fontSize: 18, fontWeight: '800' }}>
              Messaging is coming next
            </Text>
            <Text style={{ color: colors.textSoft }}>
              This area will show active conversations, booking-related chat,
              and quick access to recent threads.
            </Text>
            <Text style={{ color: colors.textFaint }}>
              For now, profile and booking flows remain available from the main tabs.
            </Text>
          </View>
        </Card>

        <AppButton label="Coming soon" onPress={() => {}} tone="secondary" disabled />
      </View>
    </Screen>
  );
}