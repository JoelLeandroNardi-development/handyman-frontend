import React from 'react';
import { Text, View } from 'react-native';
import { useNotifications } from '../notifications/NotificationsProvider';
import { APP_BACKGROUND_IMAGE } from '../theme/appChrome';
import { useTheme } from '../theme';
import { Card, Screen } from '../ui/primitives';
import { ScreenHeader } from '../ui/ScreenHeader';

export default function DiscoveryPlaceholderScreen() {
  const { colors } = useTheme();
  const { unreadCount } = useNotifications();

  return (
    <Screen backgroundImage={APP_BACKGROUND_IMAGE}>
      <ScreenHeader
        title="Discovery"
        subtitle="A curated feed of services and opportunities will live here."
        notificationBadgeCount={unreadCount}
      />

      <View style={{ paddingHorizontal: 16, paddingBottom: 28, gap: 14 }}>
        <Card>
          <View style={{ gap: 10 }}>
            <Text style={{ color: colors.text, fontSize: 18, fontWeight: '800' }}>
              Discovery is being shaped
            </Text>
            <Text style={{ color: colors.textSoft }}>
              This screen is a placeholder for browseable recommendations,
              featured services, and better exploration beyond direct matching.
            </Text>
            <Text style={{ color: colors.textFaint }}>
              The current matching flow stays in Find, while this tab becomes a lighter browse experience.
            </Text>
          </View>
        </Card>
      </View>
    </Screen>
  );
}