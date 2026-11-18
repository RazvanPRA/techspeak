import React, { memo } from 'react';
import { AppText, Button, TitledCard } from '@/components/ui';
import { t } from '@/shared/i18n';
import type { TalkRecord } from '../../model/records';
import { fillersPerMinute } from '../../services/compareTalks.service';
import { formatDuration, toLocalDay } from '@/shared/utils';

export type TalkCardProps = {
  title: string;
  talk: TalkRecord;
  onPlay: (path: string) => void;
};

/** One recorded talk: when, how long, pace, fillers, and a play button (if the audio is here). */
function TalkCardComponent({ title, talk, onPlay }: TalkCardProps) {
  return (
    <TitledCard title={title}>
      <AppText variant="caption">
        {t('talk.meta', {
          date: toLocalDay(new Date(talk.createdAt)),
          duration: formatDuration(talk.durationSeconds),
        })}
      </AppText>
      <AppText>
        {t('talk.stats', { wpm: talk.wordsPerMinute, fillers: fillersPerMinute(talk) })}
      </AppText>
      {/* A talk restored from the server has no audio (it stays on the phone that recorded it). */}
      {talk.audioPath !== '' && (
        <Button label={t('talk.play')} variant="secondary" onPress={() => onPlay(talk.audioPath)} />
      )}
    </TitledCard>
  );
}

export const TalkCard = memo(TalkCardComponent);
