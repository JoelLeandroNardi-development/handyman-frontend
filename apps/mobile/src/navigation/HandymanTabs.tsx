import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import JobsPlaceholder from "../screens/handyman/JobsPlaceholder";
import AvailabilityPlaceholder from "../screens/handyman/AvailabilityPlaceholder";
import ProfilePlaceholder from "../screens/handyman/ProfilePlaceholder";

const Tab = createBottomTabNavigator();

export default function HandymanTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Jobs" component={JobsPlaceholder} />
      <Tab.Screen name="Availability" component={AvailabilityPlaceholder} />
      <Tab.Screen name="Profile" component={ProfilePlaceholder} />
    </Tab.Navigator>
  );
}