import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText, Button } from '@/components/ui';
import { t } from '@/shared/i18n';
import { theme } from '@/shared/theme';
import { formatDuration } from '@/shared/utils';
import type { SessionBlock } from '../../model/types';
import { blockTitle } from '../../services/describeBlock.service';

export type SessionRunHeaderProps = {
  block: SessionBlock;
  position: { index: number; total: number };
  elapsed: number;
  timeUp: boolean;
  onNext: () => void;
  onSkip: () => void;
};

/** "2 of 4 · Shadowing", the block timer, and Next / Skip. */
export function SessionRunHeader({ block, position, elapsed, timeUp, onNext, onSkip }: SessionRunHeaderProps) {
  const isLast = position.index + 1 >= position.total;
  const time = t('scenarios.timer', {
    elapsed: formatDuration(elapsed),
    max: formatDuration(block.minutes * 60),
  });
  return (
    <View style={styles.header}>
      <AppText variant="heading" accessibilityRole="header">
        {t('session.blockOf', { current: position.index + 1, total: position.total, title: blockTitle(block.kind) })}
      </AppText>
      <AppText variant={timeUp ? 'body' : 'muted'}>{timeUp ? t('session.timeUp', { time }) : time}</AppText>
      <View style={styles.actions}>
        <View style={styles.action}>
          <Button label={t('session.skip')} variant="secondary" onPress={onSkip} />
        </View>
        <View style={styles.action}>
          <Button label={isLast ? t('session.finish') : t('session.next')} onPress={onNext} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: theme.space.lg,
    gap: theme.space.sm,
    backgroundColor: theme.color.surface,
  },
  actions: { flexDirection: 'row', gap: theme.space.md },
  action: { flex: 1 },
});
