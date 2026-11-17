import React from 'react';
import { AppText } from '@/components/ui';
import type { ScoredWord } from '@/services/speech';
import { t } from '@/shared/i18n';
import { formatPhonemes } from './formatPhonemes';

/** Azure's verdict on one word: overall accuracy and the score of each sound. */
export function WordScoreLines({ score }: { score: ScoredWord }) {
  return (
    <>
      <AppText>{t('word.accuracy', { accuracy: Math.round(score.accuracy) })}</AppText>
      {score.phonemes.length > 0 && (
        <AppText variant="caption">
          {t('word.sounds', { sounds: formatPhonemes(score.phonemes) })}
        </AppText>
      )}
    </>
  );
}
