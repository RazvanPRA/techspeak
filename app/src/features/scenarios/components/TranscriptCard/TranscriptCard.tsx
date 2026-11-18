import React from 'react';
import { AppText, TitledCard } from '@/components/ui';
import { t } from '@/shared/i18n';

export type TranscriptCardProps = { transcript: string };

/** "What I said": the Whisper transcript of the answer. */
export function TranscriptCard({ transcript }: TranscriptCardProps) {
  return (
    <TitledCard title={t('scenarios.transcriptTitle')}>
      <AppText variant={transcript ? 'body' : 'muted'}>
        {transcript || t('scenarios.transcriptEmpty')}
      </AppText>
    </TitledCard>
  );
}
