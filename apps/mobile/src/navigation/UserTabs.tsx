import React from 'react';
import RoleTabsBuilder from './RoleTabsBuilder';
import { USER_TAB_NAVIGATOR_CONFIG } from './roleTabConfig';

export default function UserTabs() {
  return <RoleTabsBuilder config={USER_TAB_NAVIGATOR_CONFIG} />;
}
