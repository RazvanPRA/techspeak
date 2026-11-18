import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { AppText, SegmentedControl } from '@/components/ui';
import { t } from '@/shared/i18n';
import { theme } from '@/shared/theme';
import { ListenPickPanel } from '../components/ListenPickPanel';
import { SayItPanel } from '../components/SayItPanel';
import { useMinimalPairsScreen } from '../hooks/useMinimalPairsScreen';

export type MinimalPairsScreenProps = { focusSound?: string | null };

/** Listen-and-pick / say-it drills; the daily session passes the weakest sound as focus. */
export function MinimalPairsScreen({ focusSound }: MinimalPairsScreenProps) {
  const s = useMinimalPairsScreen(focusSound);
  const panelProps = { round: s.round, onResult: s.onResult, onNext: s.next };
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <SegmentedControl segments={s.segments} selected={s.mode} onChange={s.changeMode} />
      <AppText variant="caption">
        {t('pairs.sound', { sound: s.round.pair.sound })} ·{' '}
        {t('pairs.score', { correct: s.score.correct, total: s.score.total })}
      </AppText>
      {s.mode === 'listen' ? <ListenPickPanel {...panelProps} /> : <SayItPanel {...panelProps} />}
      {s.saveError && <AppText variant="error">{s.saveError}</AppText>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: theme.color.background },
  content: { padding: theme.space.lg, gap: theme.space.lg },
});
