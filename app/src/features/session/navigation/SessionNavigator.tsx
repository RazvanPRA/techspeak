import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { t } from '@/shared/i18n';
import { SessionRunScreen } from '../screens/SessionRunScreen';
import { SessionSummaryScreen } from '../screens/SessionSummaryScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { TodayScreen } from '../screens/TodayScreen';
import type { SessionStackParamList } from './types';

const Stack = createNativeStackNavigator<SessionStackParamList>();

export function SessionNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Today" component={TodayScreen} options={{ title: t('session.title') }} />
      <Stack.Screen
        name="SessionRun"
        component={SessionRunScreen}
        options={{ title: t('session.runTitle') }}
      />
      <Stack.Screen
        name="SessionSummary"
        component={SessionSummaryScreen}
        options={{ title: t('session.summaryTitle') }}
      />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: t('settings.title') }} />
    </Stack.Navigator>
  );
}
