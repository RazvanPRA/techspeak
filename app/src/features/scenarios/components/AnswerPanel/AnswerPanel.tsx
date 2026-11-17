import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { ModelStatusBanner } from '@/components/speech';
import { AppText, Button, Card } from '@/components/ui';
import { t } from '@/shared/i18n';
import { theme } from '@/shared/theme';
import { useAnswerScreen } from '../../hooks/useAnswerScreen';
import type { AnswerResult, ScenarioPrompt } from '../../model/types';
import { AnswerTimer } from '../AnswerTimer';

export type AnswerPanelProps = {
  prompt: ScenarioPrompt;
  onDone: (result: AnswerResult) => void;
};

/** Container: the question, the timer and tap-to-start / tap-to-stop recording. */
export function AnswerPanel({ prompt, onDone }: AnswerPanelProps) {
  const s = useAnswerScreen(prompt, onDone);
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <ModelStatusBanner status={s.model.status} progress={s.model.progress} onRetry={s.model.retry} />
      <Card>
        <AppText variant="caption">{prompt.topic}</AppText>
        <AppText variant="title" accessibilityRole="header">
          {prompt.text}
        </AppText>
      </Card>
      <AnswerTimer elapsed={s.elapsed} />
      {s.phase === 'idle' && (
        <Button label={t('scenarios.start')} onPress={s.start} disabled={!s.canStart} />
      )}
      {s.phase === 'recording' && <Button label={t('scenarios.stop')} onPress={s.stop} />}
      {s.phase === 'processing' && <AppText variant="muted">{t('scenarios.processing')}</AppText>}
      {s.error && <AppText variant="error">{s.error}</AppText>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: theme.color.background },
  content: { padding: theme.space.lg, gap: theme.space.lg },
});
