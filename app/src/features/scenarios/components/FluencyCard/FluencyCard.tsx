import React from 'react';
import { AppText, TitledCard } from '@/components/ui';
import { t } from '@/shared/i18n';

export type FluencyCardProps = {
  wordsPerMinute: number;
  fillerCount: number;
  fillers: readonly string[];
  /** The server's tip; null in the on-device summary. */
  tip: string | null;
};

/** Pace, filler words and the one fluency tip. */
export function FluencyCard({ wordsPerMinute, fillerCount, fillers, tip }: FluencyCardProps) {
  return (
    <TitledCard title={t('scenarios.fluencyTitle')}>
      <AppText>{t('scenarios.wpm', { wpm: wordsPerMinute })}</AppText>
      <AppText>
        {fillerCount > 0
          ? t('scenarios.fillers', { count: fillerCount, fillers: fillers.join(', ') })
          : t('scenarios.noFillers')}
      </AppText>
      {tip && <AppText variant="muted">{tip}</AppText>}
    </TitledCard>
  );
}
