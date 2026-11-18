import React from 'react';
import { View } from 'react-native';
import { AppText, Button, Card } from '@/components/ui';
import { t } from '@/shared/i18n';
import { TALK_SECONDS } from '../../model/constants';
import type { AnswerPhase } from '../../model/types';
import { formatDuration } from '@/shared/utils';

export type TalkRecorderProps = {
  phase: AnswerPhase;
  elapsed: number;
  canStart: boolean;
  onStart: () => void;
  onStop: () => void;
};

/** "1:12 / 3:00" and tap-to-start / tap-to-stop for the 3-minute talk. */
export function TalkRecorder({ phase, elapsed, canStart, onStart, onStop }: TalkRecorderProps) {
  const time = t('scenarios.timer', {
    elapsed: formatDuration(elapsed),
    max: formatDuration(TALK_SECONDS),
  });
  return (
    <Card>
      <View accessibilityRole="timer" accessibilityLabel={time}>
        <AppText variant="title">{time}</AppText>
      </View>
      {phase === 'idle' && <Button label={t('talk.record')} onPress={onStart} disabled={!canStart} />}
      {phase === 'recording' && <Button label={t('talk.stop')} onPress={onStop} />}
      {phase === 'processing' && <AppText variant="muted">{t('talk.processing')}</AppText>}
    </Card>
  );
}
