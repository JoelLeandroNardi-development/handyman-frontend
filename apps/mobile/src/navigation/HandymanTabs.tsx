import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import JobsScreen from "../screens/handyman/JobsScreen";
import AvailabilityPlaceholder from "../screens/handyman/AvailabilityPlaceholder";
import ProfilePlaceholder from "../screens/handyman/ProfilePlaceholder";

const Tab = createBottomTabNavigator();

export default function HandymanTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Jobs" component={JobsScreen} />
      <Tab.Screen name="Availability" component={AvailabilityPlaceholder} />
      <Tab.Screen name="Profile" component={ProfilePlaceholder} />
    </Tab.Navigator>
  );
}