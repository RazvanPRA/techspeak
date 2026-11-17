import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText, Button } from '@/components/ui';
import { t } from '@/shared/i18n';
import { theme } from '@/shared/theme';

export type RoundResultProps = {
  correct: boolean;
  message: string;
  tip: string | null;
  onNext: () => void;
};

/** Feedback after a round: the verdict, the articulation tip and "Next pair". */
export function RoundResult({ correct, message, tip, onNext }: RoundResultProps) {
  return (
    <View style={styles.container}>
      <AppText style={correct ? styles.correct : styles.wrong}>{message}</AppText>
      {tip && <AppText variant="muted">{t('pairs.tip', { tip })}</AppText>}
      <Button label={t('pairs.next')} onPress={onNext} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: theme.space.md },
  correct: { color: theme.color.ok, fontWeight: '600' },
  wrong: { color: theme.color.wrong, fontWeight: '600' },
});
