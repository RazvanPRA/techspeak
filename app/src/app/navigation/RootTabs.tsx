import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MinimalPairsNavigator } from '@/features/minimal-pairs';
import { ScenariosNavigator } from '@/features/scenarios';
import { ShadowingNavigator } from '@/features/shadowing';
import { VocabularyNavigator } from '@/features/vocabulary';
import { t } from '@/shared/i18n';
import type { RootTabParamList } from './types';

const Tab = createBottomTabNavigator<RootTabParamList>();

/** One tab per feature. */
export function RootTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen
        name="ShadowingTab"
        component={ShadowingNavigator}
        options={{ title: t('tabs.shadowing') }}
      />
      <Tab.Screen
        name="VocabularyTab"
        component={VocabularyNavigator}
        options={{ title: t('tabs.vocabulary') }}
      />
      <Tab.Screen
        name="MinimalPairsTab"
        component={MinimalPairsNavigator}
        options={{ title: t('tabs.minimalPairs') }}
      />
      <Tab.Screen
        name="ScenariosTab"
        component={ScenariosNavigator}
        options={{ title: t('tabs.scenarios') }}
      />
    </Tab.Navigator>
  );
}
