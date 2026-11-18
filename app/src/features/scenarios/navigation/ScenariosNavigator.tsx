import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { t } from '@/shared/i18n';
import { AnswerScreen } from '../screens/AnswerScreen';
import { FeedbackScreen } from '../screens/FeedbackScreen';
import { InterviewScreen } from '../screens/InterviewScreen';
import { InterviewSetupScreen } from '../screens/InterviewSetupScreen';
import { InterviewSummaryScreen } from '../screens/InterviewSummaryScreen';
import { PromptListScreen } from '../screens/PromptListScreen';
import { TalkCheckScreen } from '../screens/TalkCheckScreen';
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
      <Stack.Screen
        name="InterviewSetup"
        component={InterviewSetupScreen}
        options={{ title: t('interview.title') }}
      />
      <Stack.Screen name="Interview" component={InterviewScreen} options={{ title: t('interview.title') }} />
      <Stack.Screen
        name="InterviewSummary"
        component={InterviewSummaryScreen}
        options={{ title: t('interview.summaryTitle') }}
      />
      <Stack.Screen name="TalkCheck" component={TalkCheckScreen} options={{ title: t('talk.title') }} />
    </Stack.Navigator>
  );
}
