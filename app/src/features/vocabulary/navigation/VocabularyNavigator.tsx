import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { t } from '@/shared/i18n';
import { DeckFilterScreen } from '../screens/DeckFilterScreen';
import { ReviewScreen } from '../screens/ReviewScreen';
import type { VocabularyStackParamList } from './types';

const Stack = createNativeStackNavigator<VocabularyStackParamList>();

export function VocabularyNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="DeckFilter"
        component={DeckFilterScreen}
        options={{ title: t('vocabulary.filterTitle') }}
      />
      <Stack.Screen
        name="Review"
        component={ReviewScreen}
        options={{ title: t('vocabulary.reviewTitle') }}
      />
    </Stack.Navigator>
  );
}
