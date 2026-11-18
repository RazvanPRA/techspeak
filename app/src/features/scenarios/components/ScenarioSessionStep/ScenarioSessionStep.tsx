import React, { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { EmptyState } from '@/components/ui';
import { t } from '@/shared/i18n';
import { theme } from '@/shared/theme';
import { useScenariosDependencies } from '../../dependencies/ScenariosDependencies';
import type { AnswerResult } from '../../model/types';
import { AnswerPanel } from '../AnswerPanel';
import { FeedbackView } from '../FeedbackView';

export type ScenarioSessionStepProps = { promptId: string };

/** The daily session's scenario block: one timed answer, then its feedback in place. */
export function ScenarioSessionStep({ promptId }: ScenarioSessionStepProps) {
  const { prompts } = useScenariosDependencies();
  const prompt = prompts.getPrompt(promptId);
  const [result, setResult] = useState<AnswerResult | null>(null);
  if (!prompt) return <EmptyState message={t('scenarios.unknownPrompt')} />;
  if (!result) return <AnswerPanel prompt={prompt} onDone={setResult} />;
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <FeedbackView result={result} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: theme.color.background },
  content: { padding: theme.space.lg, gap: theme.space.lg },
});
