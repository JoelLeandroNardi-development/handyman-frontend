import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import FindScreen from "../screens/user/FindScreen";
import BookingsPlaceholder from "../screens/user/BookingsPlaceholder";
import ProfilePlaceholder from "../screens/user/ProfilePlaceholder";

const Tab = createBottomTabNavigator();

export default function UserTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Find" component={FindScreen} />
      <Tab.Screen name="Bookings" component={BookingsPlaceholder} />
      <Tab.Screen name="Profile" component={ProfilePlaceholder} />
    </Tab.Navigator>
  );
}