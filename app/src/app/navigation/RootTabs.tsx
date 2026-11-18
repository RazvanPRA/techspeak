import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MinimalPairsNavigator } from '@/features/minimal-pairs';
import { ProgressNavigator } from '@/features/progress';
import { ScenariosNavigator } from '@/features/scenarios';
import { SessionNavigator } from '@/features/session';
import { ShadowingNavigator } from '@/features/shadowing';
import { VocabularyNavigator } from '@/features/vocabulary';
import { t } from '@/shared/i18n';
import type { RootTabParamList } from './types';

const Tab = createBottomTabNavigator<RootTabParamList>();

/** Today (the daily session) first, then one tab per drill, then Progress. */
export function RootTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="TodayTab" component={SessionNavigator} options={{ title: t('tabs.today') }} />
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
      <Tab.Screen
        name="ProgressTab"
        component={ProgressNavigator}
        options={{ title: t('tabs.progress') }}
      />
    </Tab.Navigator>
  );
}
