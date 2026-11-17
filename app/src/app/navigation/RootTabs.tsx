import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ShadowingNavigator } from '@/features/shadowing';
import { t } from '@/shared/i18n';
import type { RootTabParamList } from './types';

const Tab = createBottomTabNavigator<RootTabParamList>();

// One tab per feature. Milestone 2 adds vocabulary and minimal pairs here.
export function RootTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen
        name="ShadowingTab"
        component={ShadowingNavigator}
        options={{ title: t('tabs.shadowing') }}
      />
    </Tab.Navigator>
  );
}
