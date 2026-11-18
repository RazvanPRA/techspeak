import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText, TitledCard } from '@/components/ui';
import { t } from '@/shared/i18n';
import { theme } from '@/shared/theme';
import type { ScenarioFeedback } from '../../model/types';

export type BetterWayCardProps = {
  corrections: ScenarioFeedback['corrections'];
  improvedAnswer: string;
};

/**
 * "What I said" vs "a better way to say it". Needs an LLM provider on the server (deferred),
 * so it renders nothing while both fields are empty.
 */
export function BetterWayCard({ corrections, improvedAnswer }: BetterWayCardProps) {
  if (corrections.length === 0 && improvedAnswer === '') return null;
  return (
    <TitledCard title={t('scenarios.betterTitle')} testID="better-way">
      {corrections.map(c => (
        <View key={`${c.said}→${c.better}`} style={styles.correction}>
          <AppText>{t('scenarios.correction', { said: c.said, better: c.better })}</AppText>
          <AppText variant="caption">{c.why}</AppText>
        </View>
      ))}
      {improvedAnswer !== '' && <AppText variant="muted">{improvedAnswer}</AppText>}
    </TitledCard>
  );
}

const styles = StyleSheet.create({ correction: { gap: theme.space.xs } });
