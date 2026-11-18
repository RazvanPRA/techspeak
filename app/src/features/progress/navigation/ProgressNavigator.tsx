import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { t } from '@/shared/i18n';
import { ProgressScreen } from '../screens/ProgressScreen';
import type { ProgressStackParamList } from './types';

const Stack = createNativeStackNavigator<ProgressStackParamList>();

export function ProgressNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Progress" component={ProgressScreen} options={{ title: t('progress.title') }} />
    </Stack.Navigator>
  );
}
