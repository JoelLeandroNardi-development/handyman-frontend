import React, { useMemo } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { View } from 'react-native';
import { useTheme } from '../theme';
import { createTabBarConfig } from '../lib/tabBarConfig';

const Tab = createBottomTabNavigator();

export interface TabDefinition {
  name: string;
  component: React.ComponentType<any>;
  iconName: React.ComponentProps<typeof MaterialIcons>['name'];
}

interface RoleTabNavigatorProps {
  tabs: TabDefinition[];
  rootNavigatorName: string;
}

export default function RoleTabNavigator({
  tabs,
  rootNavigatorName,
}: RoleTabNavigatorProps) {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { colors, tokens } = useTheme();
  const tabConfig = useMemo(() => createTabBarConfig(tokens), [tokens]);

  const bottomPadding = Math.max(insets.bottom, tokens.spacing.sm);
  const tabBarHeight = 76 + bottomPadding;

  const createModalAwareTabListener = (tabName: string) => ({
    tabPress: (e: any) => {
      const parentNav = navigation.getParent();
      const parentState = parentNav?.getState();
      const topRouteName = parentState?.routes[parentState.index ?? 0]?.name;
      const isModalOpen =
        topRouteName === 'NotificationsModal' ||
        topRouteName === 'ProfileModal';

      if (isModalOpen) {
        e.preventDefault();
        parentNav?.navigate(rootNavigatorName, { screen: tabName });
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
          const tab = tabs.find(t => t.name === route.name);
          return (
            <View
              style={[
                tabConfig.tabIconContainerStyle,
                {
                  backgroundColor: focused ? colors.primarySoft : 'transparent',
                },
              ]}>
              <MaterialIcons
                name={tab?.iconName ?? 'circle'}
                color={color}
                size={size ?? tokens.sizing.iconLarge}
              />
            </View>
          );
        },
      })}>
      {tabs.map(tab => (
        <Tab.Screen
          key={tab.name}
          name={tab.name}
          component={tab.component}
          listeners={createModalAwareTabListener(tab.name)}
        />
      ))}
    </Tab.Navigator>
  );
}
