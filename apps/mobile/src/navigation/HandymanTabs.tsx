import React from 'react';
import RoleTabsBuilder from './RoleTabsBuilder';
import { HANDYMAN_TAB_NAVIGATOR_CONFIG } from './roleTabConfig';

export default function HandymanTabs() {
  return <RoleTabsBuilder config={HANDYMAN_TAB_NAVIGATOR_CONFIG} />;
}
