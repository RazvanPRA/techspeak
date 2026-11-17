import React, { useCallback } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { EmptyState } from '@/components/ui';
import { t } from '@/shared/i18n';
import { AnswerPanel } from '../components/AnswerPanel';
import { useScenariosDependencies } from '../dependencies/ScenariosDependencies';
import type { AnswerResult } from '../model/types';
import type { ScenariosStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<ScenariosStackParamList, 'ScenarioAnswer'>;

/** Looks up the prompt; the timed answer itself lives in AnswerPanel. */
export function AnswerScreen({ navigation, route }: Props) {
  const { prompts } = useScenariosDependencies();
  const prompt = prompts.getPrompt(route.params.promptId);
  const onDone = useCallback(
    (result: AnswerResult) => navigation.replace('ScenarioFeedback', { result }),
    [navigation],
  );
  if (!prompt) return <EmptyState message={t('scenarios.unknownPrompt')} />;
  return <AnswerPanel prompt={prompt} onDone={onDone} />;
}
