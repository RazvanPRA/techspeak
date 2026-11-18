import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { t } from '@/shared/i18n';
import { AnswerScreen } from '../screens/AnswerScreen';
import { FeedbackScreen } from '../screens/FeedbackScreen';
import { PromptListScreen } from '../screens/PromptListScreen';
import type { ScenariosStackParamList } from './types';

const Stack = createNativeStackNavigator<ScenariosStackParamList>();

export function ScenariosNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ScenarioPrompts"
        component={PromptListScreen}
        options={{ title: t('scenarios.listTitle') }}
      />
      <Stack.Screen
        name="ScenarioAnswer"
        component={AnswerScreen}
        options={{ title: t('scenarios.answerTitle') }}
      />
      <Stack.Screen
        name="ScenarioFeedback"
        component={FeedbackScreen}
        options={{ title: t('scenarios.feedbackTitle') }}
      />
    </Stack.Navigator>
  );
}
