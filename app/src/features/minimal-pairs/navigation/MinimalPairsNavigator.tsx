import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { t } from '@/shared/i18n';
import { MinimalPairsScreen } from '../screens/MinimalPairsScreen';
import type { MinimalPairsStackParamList } from './types';

const Stack = createNativeStackNavigator<MinimalPairsStackParamList>();

export function MinimalPairsNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MinimalPairs"
        component={MinimalPairsScreen}
        options={{ title: t('pairs.title') }}
      />
    </Stack.Navigator>
  );
}
