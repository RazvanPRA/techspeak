import React from 'react';
import { StyleSheet } from 'react-native';
import { HoldToRecordButton } from '@/components/speech';
import { AppText, Button, Card } from '@/components/ui';
import { t } from '@/shared/i18n';
import { theme } from '@/shared/theme';
import { RoundResult } from '../RoundResult';
import { sayItFeedback } from './sayItFeedback';
import type { SayItRoundProps } from './SayItRound.types';

/** "Say “think”" (not “sink”): hold to talk, then see what was heard. */
export function SayItRound({ round, result, record, recordDisabled, handlers }: SayItRoundProps) {
  const correct = result?.verdict === 'correct';
  return (
    <Card testID="say-round">
      <AppText variant="title" accessibilityRole="header">
        {t('pairs.sayPrompt', { word: round.target.word })}
      </AppText>
      <AppText style={styles.ipa}>{round.target.ipa}</AppText>
      <AppText variant="muted">{t('pairs.sayHint', { other: round.other.word })}</AppText>
      <Button label={t('word.listen')} variant="secondary" onPress={handlers.onListen} />
      {!correct && (
        <HoldToRecordButton
          phase={record.phase}
          disabled={recordDisabled}
          onStart={record.start}
          onStop={record.stop}
        />
      )}
      {result && (
        <RoundResult
          correct={correct}
          message={sayItFeedback(round, result)}
          tip={correct ? null : round.pair.tip}
          onNext={handlers.onNext}
        />
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  ipa: { fontSize: theme.font.lg, color: theme.color.primary },
});
