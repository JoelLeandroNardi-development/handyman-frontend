import React, { useMemo } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { View } from 'react-native';
import { useTheme } from '../theme';
import { createTabBarConfig } from '../lib/tabBarConfig';
import type { RoleTabNavigatorConfig, TabIconName } from './roleTabConfig';

const Tab = createBottomTabNavigator();

type RoleTabsBuilderProps<TTabName extends string> = {
  config: RoleTabNavigatorConfig<TTabName>;
};

export default function RoleTabsBuilder<TTabName extends string>({
  config,
}: RoleTabsBuilderProps<TTabName>) {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { colors, tokens } = useTheme();
  const tabConfig = useMemo(() => createTabBarConfig(tokens), [tokens]);

  const bottomPadding = Math.max(insets.bottom, tokens.spacing.sm);
  const tabBarHeight = 76 + bottomPadding;

  const iconMap = useMemo<Record<string, TabIconName>>(() => {
    const mapped: Record<string, TabIconName> = {};
    for (const tab of config.tabs) {
      mapped[tab.name] = tab.icon;
    }
    return mapped;
  }, [config.tabs]);

  const createModalAwareTabListener = (tabName: TTabName) => ({
    tabPress: (e: any) => {
      const parentNav = navigation.getParent();
      const parentState = parentNav?.getState();
      const topRouteName = parentState?.routes[parentState.index ?? 0]?.name;
      const isModalOpen =
        topRouteName === 'NotificationsModal' ||
        topRouteName === 'ProfileModal';

      if (isModalOpen) {
        e.preventDefault();
        parentNav?.navigate(config.rootNavigatorName, { screen: tabName });
      }
    },
  });

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
          const iconName = iconMap[route.name] ?? 'circle';
          return (
            <View
              style={[
                tabConfig.tabIconContainerStyle,
                {
                  backgroundColor: focused ? colors.primarySoft : 'transparent',
                },
              ]}>
              <MaterialIcons
                name={iconName}
                color={color}
                size={size ?? tokens.sizing.iconLarge}
              />
            </View>
          );
        },
      })}>
      {config.tabs.map(tab => {
        const ScreenComponent = config.screenMap[tab.name];
        return (
          <Tab.Screen
            key={tab.name}
            name={tab.name}
            component={ScreenComponent}
            listeners={createModalAwareTabListener(tab.name)}
          />
        );
      })}
    </Tab.Navigator>
  );
}
