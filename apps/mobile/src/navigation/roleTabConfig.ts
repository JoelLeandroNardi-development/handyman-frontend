import type { MaterialIcons } from '@expo/vector-icons';
import type React from 'react';
import type { RoleMode } from '../auth/session';
import ChatPlaceholderScreen from '../screens/ChatPlaceholderScreen';
import DiscoveryPlaceholderScreen from '../screens/DiscoveryPlaceholderScreen';
import AvailabilityPlaceholder from '../screens/handyman/AvailabilityPlaceholder';
import JobsScreen from '../screens/handyman/JobsScreen';
import BookingsPlaceholder from '../screens/user/BookingsPlaceholder';
import FindScreen from '../screens/user/FindScreen';

export type RootNavigatorName = 'UserTabs' | 'HandymanTabs';

export type TabIconName = React.ComponentProps<typeof MaterialIcons>['name'];

export type RoleTabDefinition<TTabName extends string> = {
  name: TTabName;
  icon: TabIconName;
};

export type RoleTabNavigatorConfig<TTabName extends string> = {
  rootNavigatorName: RootNavigatorName;
  tabs: readonly RoleTabDefinition<TTabName>[];
  screenMap: Record<TTabName, React.ComponentType<any>>;
};

export type UserTabName = 'Find' | 'Discovery' | 'Bookings' | 'Chat';
export type HandymanTabName = 'Jobs' | 'Discovery' | 'Availability' | 'Chat';

const USER_TABS: readonly RoleTabDefinition<UserTabName>[] = [
  { name: 'Find', icon: 'travel-explore' },
  { name: 'Discovery', icon: 'explore' },
  { name: 'Bookings', icon: 'event-available' },
  { name: 'Chat', icon: 'chat-bubble-outline' },
];

const HANDYMAN_TABS: readonly RoleTabDefinition<HandymanTabName>[] = [
  { name: 'Jobs', icon: 'work' },
  { name: 'Discovery', icon: 'explore' },
  { name: 'Availability', icon: 'event-available' },
  { name: 'Chat', icon: 'chat-bubble-outline' },
];

export const USER_TAB_NAVIGATOR_CONFIG: RoleTabNavigatorConfig<UserTabName> = {
  rootNavigatorName: 'UserTabs',
  tabs: USER_TABS,
  screenMap: {
    Find: FindScreen,
    Discovery: DiscoveryPlaceholderScreen,
    Bookings: BookingsPlaceholder,
    Chat: ChatPlaceholderScreen,
  },
};

export const HANDYMAN_TAB_NAVIGATOR_CONFIG: RoleTabNavigatorConfig<HandymanTabName> =
  {
    rootNavigatorName: 'HandymanTabs',
    tabs: HANDYMAN_TABS,
    screenMap: {
      Jobs: JobsScreen,
      Discovery: DiscoveryPlaceholderScreen,
      Availability: AvailabilityPlaceholder,
      Chat: ChatPlaceholderScreen,
    },
  };

export function getRoleTabNavigatorName(role: RoleMode): RootNavigatorName {
  return role === 'handyman' ? 'HandymanTabs' : 'UserTabs';
}
