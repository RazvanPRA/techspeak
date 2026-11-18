import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppText, Button, Card } from '@/components/ui';
import { t } from '@/shared/i18n';
import { theme } from '@/shared/theme';
import { formatDuration } from '@/shared/utils';
import type { BlockKind } from '../model/types';
import type { SessionStackParamList } from '../navigation/types';
import { blockTitle, streakText } from '../services/describeBlock.service';

type Props = NativeStackScreenProps<SessionStackParamList, 'SessionSummary'>;

const titles = (kinds: readonly BlockKind[]) => kinds.map(blockTitle).join(', ');

/** What was done today and the streak. */
export function SessionSummaryScreen({ navigation, route }: Props) {
  const { summary } = route.params;
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Card>
        <AppText variant="title" accessibilityRole="header">
          {summary.completed.length > 0 ? t('session.wellDone') : t('session.nothingDone')}
        </AppText>
        <AppText>{streakText(summary.streak)}</AppText>
        <AppText variant="muted">
          {t('session.timeSpent', { time: formatDuration(summary.elapsedSeconds) })}
        </AppText>
      </Card>
      {summary.completed.length > 0 && (
        <AppText>{t('session.completed', { blocks: titles(summary.completed) })}</AppText>
      )}
      {summary.skipped.length > 0 && (
        <AppText variant="muted">{t('session.skipped', { blocks: titles(summary.skipped) })}</AppText>
      )}
      <Button label={t('session.done')} onPress={navigation.popToTop} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: theme.color.background },
  content: { padding: theme.space.lg, gap: theme.space.lg },
});
