import React from 'react';
import { AppText, Button, Card } from '@/components/ui';
import { t } from '@/shared/i18n';
import { PASS_SCORE } from '../../model/constants';
import { styles } from './AttemptResultPanel.styles';
import type { AttemptResultPanelProps } from './AttemptResultPanel.types';

export function AttemptResultPanel({ result, onNext }: AttemptResultPanelProps) {
  const { score, passed, transcript, extraWords } = result;
  return (
    <Card testID="attempt-result">
      <AppText
        variant="title"
        accessibilityRole="header"
        style={passed ? styles.passed : styles.failed}>
        {t('shadowing.score', { score })}
      </AppText>
      <AppText>
        {passed ? t('shadowing.passed') : t('shadowing.keepGoing', { target: PASS_SCORE })}
      </AppText>
      {transcript !== '' && (
        <AppText variant="caption">{t('shadowing.heard', { transcript })}</AppText>
      )}
      {extraWords.length > 0 && (
        <AppText variant="caption">
          {t('shadowing.extraWords', { words: extraWords.join(', ') })}
        </AppText>
      )}
      {passed && <Button label={t('shadowing.next')} onPress={onNext} />}
    </Card>
  );
}
