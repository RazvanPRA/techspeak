import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/ui';
import { t } from '@/shared/i18n';
import { theme } from '@/shared/theme';
import { MAX_ANSWER_SECONDS, MIN_ANSWER_SECONDS } from '../../model/constants';
import { formatDuration } from '../../services/formatDuration.service';

export type AnswerTimerProps = { elapsed: number };

/** "0:42 / 2:00", green once the answer reaches one minute. */
export function AnswerTimer({ elapsed }: AnswerTimerProps) {
  const longEnough = elapsed >= MIN_ANSWER_SECONDS;
  const time = t('scenarios.timer', {
    elapsed: formatDuration(elapsed),
    max: formatDuration(MAX_ANSWER_SECONDS),
  });
  return (
    <View style={styles.container} accessibilityRole="timer" accessibilityLabel={time}>
      <AppText variant="title" style={longEnough ? styles.ok : undefined}>
        {time}
      </AppText>
      <AppText variant="muted">
        {longEnough ? t('scenarios.goodLength') : t('scenarios.keepGoing')}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: theme.space.xs },
  ok: { color: theme.color.ok },
});
