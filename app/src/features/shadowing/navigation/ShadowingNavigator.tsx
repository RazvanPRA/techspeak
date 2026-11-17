import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { t } from '@/shared/i18n';
import { DeckPickerScreen } from '../screens/DeckPickerScreen';
import { ShadowingScreen } from '../screens/ShadowingScreen';
import type { ShadowingStackParamList } from './types';

const Stack = createNativeStackNavigator<ShadowingStackParamList>();

export function ShadowingNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="DeckPicker"
        component={DeckPickerScreen}
        options={{ title: t('decks.title') }}
      />
      <Stack.Screen
        name="Shadowing"
        component={ShadowingScreen}
        options={{ title: t('shadowing.title') }}
      />
    </Stack.Navigator>
  );
}
