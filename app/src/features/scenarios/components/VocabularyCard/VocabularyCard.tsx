import React from 'react';
import { AppText, TitledCard } from '@/components/ui';
import { t } from '@/shared/i18n';
import type { ScenarioFeedback } from '../../model/types';

export type VocabularyCardProps = { vocabulary: ScenarioFeedback['vocabulary'] };

/** Deck terms the answer used, and the ones to try next time. */
export function VocabularyCard({ vocabulary }: VocabularyCardProps) {
  const { used, missing } = vocabulary;
  return (
    <TitledCard title={t('scenarios.vocabularyTitle')}>
      <AppText>
        {used.length > 0
          ? t('scenarios.termsUsed', { terms: used.join(', ') })
          : t('scenarios.termsNone')}
      </AppText>
      {missing.length > 0 && (
        <AppText variant="muted">{t('scenarios.termsMissing', { terms: missing.join(', ') })}</AppText>
      )}
    </TitledCard>
  );
}
