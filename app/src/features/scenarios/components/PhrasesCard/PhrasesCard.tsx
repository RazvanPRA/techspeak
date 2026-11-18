import React from 'react';
import { AppText, TitledCard } from '@/components/ui';
import { t } from '@/shared/i18n';

export type PhrasesCardProps = { phrases: readonly string[] };

/** Model sentences from the deck to say out loud and reuse. Nothing when empty. */
export function PhrasesCard({ phrases }: PhrasesCardProps) {
  if (phrases.length === 0) return null;
  return (
    <TitledCard title={t('scenarios.phrasesTitle')}>
      {phrases.map(phrase => (
        <AppText key={phrase}>“{phrase}”</AppText>
      ))}
    </TitledCard>
  );
}
