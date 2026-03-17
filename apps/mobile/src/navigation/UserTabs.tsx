import React, { useMemo } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { View } from 'react-native';
import FindScreen from '../screens/user/FindScreen';
import BookingsPlaceholder from '../screens/user/BookingsPlaceholder';
import { useTheme } from '../theme';
import { createTabBarConfig } from '../lib/tabBarConfig';

const Tab = createBottomTabNavigator();

function PlaceholderTabScreen() {
  return null;
}

function getUserTabIconName(
  routeName: string,
): React.ComponentProps<typeof MaterialIcons>['name'] {
  switch (routeName) {
    case 'Find':
      return 'travel-explore';
    case 'Bookings':
      return 'event-available';
    case 'Discovery':
      return 'explore';
    case 'Chat':
      return 'chat-bubble-outline';
    default:
      return 'circle';
  }
}

export default function UserTabs() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { colors, tokens } = useTheme();
  const tabConfig = useMemo(() => createTabBarConfig(tokens), [tokens]);

  const bottomPadding = Math.max(insets.bottom, tokens.spacing.sm);
  const tabBarHeight = 76 + bottomPadding;

  const createModalAwareTabListener = (tabName: 'Find' | 'Bookings') => ({
    tabPress: (e: any) => {
      const parentNav = navigation.getParent();
      const parentState = parentNav?.getState();
      const topRouteName = parentState?.routes[parentState.index ?? 0]?.name;
      const isModalOpen =
        topRouteName === 'NotificationsModal' ||
        topRouteName === 'ProfileModal';

      if (isModalOpen) {
        e.preventDefault();
        parentNav?.navigate('UserTabs', { screen: tabName });
      }
    },
  });

  const noopTabListener = {
    tabPress: (e: any) => {
      e.preventDefault();
    },
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarStyle: {
          height: tabBarHeight,
          paddingTop: tokens.spacing.sm,
          paddingBottom: bottomPadding,
          backgroundColor: colors.bg,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        },
        tabBarLabelStyle: tabConfig.tabBarLabelStyle,
        tabBarIconStyle: tabConfig.tabBarIconStyle,
        tabBarIcon: ({ color, size, focused }) => {
          return (
            <View
              style={[
                tabConfig.tabIconContainerStyle,
                {
                  backgroundColor: focused ? colors.primarySoft : 'transparent',
                },
              ]}>
              <MaterialIcons
                name={getUserTabIconName(route.name)}
                color={color}
                size={size ?? tokens.sizing.iconLarge}
              />
            </View>
          );
        },
      })}>
      <Tab.Screen
        name="Find"
        component={FindScreen}
        listeners={createModalAwareTabListener('Find')}
      />
      <Tab.Screen
        name="Discovery"
        component={PlaceholderTabScreen}
        listeners={noopTabListener}
      />
      <Tab.Screen
        name="Bookings"
        component={BookingsPlaceholder}
        listeners={createModalAwareTabListener('Bookings')}
      />
      <Tab.Screen
        name="Chat"
        component={PlaceholderTabScreen}
        listeners={noopTabListener}
      />
    </Tab.Navigator>
  );
}
