import React from 'react';
import { View } from 'react-native';
import { HoldToRecordButton } from '@/components/speech';
import { Button } from '@/components/ui';
import { t } from '@/shared/i18n';
import { styles } from './ReviewActions.styles';
import type { ReviewActionsProps } from './ReviewActions.types';
import { SayItFeedback } from './SayItFeedback';
import { SelfGradeButtons } from './SelfGradeButtons';

/**
 * Say it → recognised: "Next card" (graded automatically).
 * Not recognised or "Show answer": try again, or grade yourself.
 */
export function ReviewActions({ outcome, revealed, recordDisabled, record, actions }: ReviewActionsProps) {
  const recognised = outcome.kind === 'recognised';
  return (
    <View style={styles.section}>
      <SayItFeedback outcome={outcome} />
      {recognised ? (
        <Button label={t('vocabulary.next')} onPress={actions.onNext} />
      ) : (
        <HoldToRecordButton
          phase={record.phase}
          disabled={recordDisabled}
          onStart={record.start}
          onStop={record.stop}
        />
      )}
      {!recognised && !revealed && (
        <Button label={t('vocabulary.showAnswer')} variant="secondary" onPress={actions.onReveal} />
      )}
      {!recognised && revealed && <SelfGradeButtons onGrade={actions.onGrade} />}
    </View>
  );
}
