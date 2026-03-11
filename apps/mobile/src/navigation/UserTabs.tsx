import React from "react";
import { Text } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import FindScreen from "../screens/user/FindScreen";
import BookingsPlaceholder from "../screens/user/BookingsPlaceholder";
import ProfilePlaceholder from "../screens/user/ProfilePlaceholder";
import { useTheme } from "../theme";

const Tab = createBottomTabNavigator();

function TabIcon({
  label,
  focused,
  color,
}: {
  label: string;
  focused: boolean;
  color: string;
}) {
  return (
    <Text
      style={{
        fontSize: 13,
        fontWeight: focused ? "800" : "600",
        color,
        marginTop: 2,
      }}
    >
      {label}
    </Text>
  );
}

export default function UserTabs() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const tabBarHeight = 64 + Math.max(insets.bottom, 8);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarStyle: {
          height: tabBarHeight,
          paddingTop: 8,
          paddingBottom: Math.max(insets.bottom, 8),
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        },
        tabBarLabelStyle: {
          fontSize: 13,
          fontWeight: "700",
          marginBottom: 2,
        },
        tabBarIcon: ({ focused, color }) => (
          <TabIcon label={route.name} focused={focused} color={color} />
        ),
      })}
    >
      <Tab.Screen name="Find" component={FindScreen} />
      <Tab.Screen name="Bookings" component={BookingsPlaceholder} />
      <Tab.Screen name="Profile" component={ProfilePlaceholder} />
    </Tab.Navigator>
  );
}