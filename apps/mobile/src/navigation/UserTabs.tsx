import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import FindScreen from "../screens/user/FindScreen";
import BookingsPlaceholder from "../screens/user/BookingsPlaceholder";
import ProfilePlaceholder from "../screens/user/ProfilePlaceholder";
import { useTheme } from "../theme";

const Tab = createBottomTabNavigator();

function getUserTabIconName(
  routeName: string
): React.ComponentProps<typeof MaterialIcons>["name"] {
  switch (routeName) {
    case "Find":
      return "travel-explore";
    case "Bookings":
      return "event-available";
    case "Profile":
      return "manage-accounts";
    default:
      return "circle";
  }
}

export default function UserTabs() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const tabBarHeight = 72 + Math.max(insets.bottom, 10);

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
          paddingBottom: Math.max(insets.bottom, 10),
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "700",
          marginBottom: 2,
        },
        tabBarIconStyle: {
          marginTop: 2,
        },
        tabBarIcon: ({ color, size }) => (
          <MaterialIcons
            name={getUserTabIconName(route.name)}
            color={color}
            size={size ?? 24}
          />
        ),
      })}
    >
      <Tab.Screen name="Find" component={FindScreen} />
      <Tab.Screen name="Bookings" component={BookingsPlaceholder} />
      <Tab.Screen name="Profile" component={ProfilePlaceholder} />
    </Tab.Navigator>
  );
}