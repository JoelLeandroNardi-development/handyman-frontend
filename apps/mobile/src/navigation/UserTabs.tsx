import React from 'react';
import FindScreen from '../screens/user/FindScreen';
import BookingsPlaceholder from '../screens/user/BookingsPlaceholder';
import ChatPlaceholderScreen from '../screens/ChatPlaceholderScreen';
import DiscoveryPlaceholderScreen from '../screens/DiscoveryPlaceholderScreen';
import RoleTabNavigator, { type TabDefinition } from './RoleTabNavigator';

const USER_TABS: TabDefinition[] = [
  { name: 'Find', component: FindScreen, iconName: 'travel-explore' },
  { name: 'Discovery', component: DiscoveryPlaceholderScreen, iconName: 'explore' },
  { name: 'Bookings', component: BookingsPlaceholder, iconName: 'event-available' },
  { name: 'Chat', component: ChatPlaceholderScreen, iconName: 'chat-bubble-outline' },
];

export default function UserTabs() {
  return <RoleTabNavigator tabs={USER_TABS} rootNavigatorName="UserTabs" />;
}
