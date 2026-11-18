import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { AppText, EmptyState, TitledCard } from '@/components/ui';
import { t } from '@/shared/i18n';
import { theme } from '@/shared/theme';
import { ChartCard } from '../components/ChartCard';
import { WeakSoundsCard } from '../components/WeakSoundsCard';
import { useProgressData } from '../hooks/useProgressData';
import { SCORE_MAX } from '../model/constants';
import { dayPoints, deckPoints, fillerPoints, wpmPoints } from '../services/toChartPoints.service';

/** Scores per day and deck, words mastered, weakest sounds, pace and filler trends. */
export function ProgressScreen() {
  const { data, status } = useProgressData();
  if (status === 'error') return <EmptyState message={t('progress.loadError')} />;
  if (!data) return <EmptyState message={t('progress.loading')} />;
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <ChartCard
        title={t('progress.scoreByDay')}
        kind="line"
        points={dayPoints(data.scoreByDay)}
        maxValue={SCORE_MAX}
        emptyMessage={t('progress.empty')}
      />
      <ChartCard
        title={t('progress.scoreByDeck')}
        kind="bar"
        points={deckPoints(data.scoreByDeck)}
        maxValue={SCORE_MAX}
        emptyMessage={t('progress.empty')}
      />
      <TitledCard title={t('progress.mastered')}>
        <AppText>{t('progress.masteredCount', { count: data.masteredWords })}</AppText>
      </TitledCard>
      <WeakSoundsCard sounds={data.weakSounds} />
      <ChartCard
        title={t('progress.wpm')}
        kind="line"
        points={wpmPoints(data.fluency)}
        emptyMessage={t('progress.noScenarios')}
      />
      <ChartCard
        title={t('progress.fillers')}
        kind="line"
        points={fillerPoints(data.fluency)}
        emptyMessage={t('progress.noScenarios')}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: theme.color.background },
  content: { padding: theme.space.lg, gap: theme.space.lg },
});
