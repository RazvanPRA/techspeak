import React from 'react';
import { AppText, Card } from '@/components/ui';
import { t } from '@/shared/i18n';
import type { AnswerResult } from '../../model/types';

export type FeedbackSummaryProps = { result: AnswerResult };

/** The prompt, the score and the one strength, or why server feedback is missing. */
export function FeedbackSummary({ result }: FeedbackSummaryProps) {
  const { feedback, prompt } = result;
  return (
    <Card testID="feedback-summary">
      <AppText variant="caption">{prompt.text}</AppText>
      {feedback ? (
        <>
          <AppText variant="title" accessibilityRole="header">
            {t('scenarios.score', { score: Math.round(feedback.overallScore) })}
          </AppText>
          <AppText>{feedback.strength}</AppText>
        </>
      ) : (
        <AppText variant="error">
          {t('scenarios.offline', { reason: result.feedbackError ?? '' })}
        </AppText>
      )}
    </Card>
  );
}
