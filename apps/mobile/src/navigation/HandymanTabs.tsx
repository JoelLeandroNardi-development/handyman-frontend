import React from 'react';
import JobsScreen from '../screens/handyman/JobsScreen';
import AvailabilityPlaceholder from '../screens/handyman/AvailabilityPlaceholder';
import ChatPlaceholderScreen from '../screens/ChatPlaceholderScreen';
import DiscoveryPlaceholderScreen from '../screens/DiscoveryPlaceholderScreen';
import RoleTabNavigator, { type TabDefinition } from './RoleTabNavigator';

const HANDYMAN_TABS: TabDefinition[] = [
  { name: 'Jobs', component: JobsScreen, iconName: 'work' },
  { name: 'Discovery', component: DiscoveryPlaceholderScreen, iconName: 'explore' },
  { name: 'Availability', component: AvailabilityPlaceholder, iconName: 'event-available' },
  { name: 'Chat', component: ChatPlaceholderScreen, iconName: 'chat-bubble-outline' },
];

export default function HandymanTabs() {
  return <RoleTabNavigator tabs={HANDYMAN_TABS} rootNavigatorName="HandymanTabs" />;
}
