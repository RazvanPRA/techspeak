import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText, TitledCard } from '@/components/ui';
import { t } from '@/shared/i18n';
import { theme } from '@/shared/theme';
import type { ScenarioFeedback } from '../../model/types';

export type PronunciationCardProps = { tips: ScenarioFeedback['pronunciation'] };

/** Words to work on, with IPA and a tip. Renders nothing when there are none. */
export function PronunciationCard({ tips }: PronunciationCardProps) {
  if (tips.length === 0) return null;
  return (
    <TitledCard title={t('scenarios.pronunciationTitle')}>
      {tips.map(tip => (
        <View key={tip.word} style={styles.tip}>
          <AppText style={styles.word}>
            {tip.word} {tip.ipa && <AppText style={styles.ipa}>{tip.ipa}</AppText>}
          </AppText>
          <AppText variant="muted">{tip.tip}</AppText>
        </View>
      ))}
    </TitledCard>
  );
}

const styles = StyleSheet.create({
  tip: { gap: theme.space.xs },
  word: { fontWeight: '600' },
  ipa: { color: theme.color.primary, fontWeight: '400' },
});
