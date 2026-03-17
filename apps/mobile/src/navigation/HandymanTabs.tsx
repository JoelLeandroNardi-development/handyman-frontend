import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import JobsScreen from "../screens/handyman/JobsScreen";
import AvailabilityPlaceholder from "../screens/handyman/AvailabilityPlaceholder";
import ProfilePlaceholder from "../screens/handyman/ProfilePlaceholder";
import NotificationsScreen from "../screens/NotificationsScreen";
import { useTheme } from "../theme";
import { useNotifications } from "../notifications/NotificationsProvider";

const Tab = createBottomTabNavigator();

function getHandymanTabIconName(
  routeName: string
): React.ComponentProps<typeof MaterialIcons>["name"] {
  switch (routeName) {
    case "Jobs":
      return "work";
    case "Availability":
      return "event-available";
    case "Notifications":
      return "notifications";
    case "Profile":
      return "manage-accounts";
    default:
      return "circle";
  }
}

export default function HandymanTabs() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { unreadCount } = useNotifications();

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
        tabBarIcon: ({ color, size }) => {
          const showBadge = route.name === "Notifications" && unreadCount > 0;

          return (
            <View>
              <MaterialIcons
                name={getHandymanTabIconName(route.name)}
                color={color}
                size={size ?? 24}
              />
              {showBadge ? (
                <View
                  style={{
                    position: "absolute",
                    top: -6,
                    right: -10,
                    minWidth: 18,
                    height: 18,
                    borderRadius: 9,
                    backgroundColor: colors.danger,
                    alignItems: "center",
                    justifyContent: "center",
                    paddingHorizontal: 4,
                  }}
                >
                  <Text style={{ color: "#fff", fontSize: 10, fontWeight: "800" }}>
                    {unreadCount > 99 ? "99+" : String(unreadCount)}
                  </Text>
                </View>
              ) : null}
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="Jobs" component={JobsScreen} />
      <Tab.Screen name="Availability" component={AvailabilityPlaceholder} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} />
      <Tab.Screen name="Profile" component={ProfilePlaceholder} />
    </Tab.Navigator>
  );
}