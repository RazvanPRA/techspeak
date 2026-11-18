import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { ModelStatusBanner } from '@/components/speech';
import { AppText, EmptyState } from '@/components/ui';
import { t } from '@/shared/i18n';
import { theme } from '@/shared/theme';
import { ReviewActions } from '../components/ReviewActions';
import { TermCard } from '../components/TermCard';
import { useReviewScreen } from '../hooks/useReviewScreen';

function statusMessage(status: string, total: number): string {
  if (status === 'loading') return t('vocabulary.loading');
  if (status === 'error') return t('vocabulary.loadError');
  return total === 0 ? t('vocabulary.empty') : t('vocabulary.done', { count: total });
}

export function ReviewScreen() {
  const s = useReviewScreen();
  const { status, current, index, total } = s.queue;

  if (status !== 'ready' || !current) return <EmptyState message={statusMessage(status, total)} />;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <ModelStatusBanner status={s.model.status} progress={s.model.progress} onRetry={s.model.retry} />
      <AppText variant="caption">
        {t('vocabulary.progress', { current: index + 1, total })}
      </AppText>
      <TermCard term={current.term} revealed={s.revealed} onListen={s.listen} />
      <ReviewActions
        outcome={s.outcome}
        revealed={s.revealed}
        recordDisabled={s.model.status !== 'ready'}
        record={s.record}
        actions={s.actions}
      />
      {s.error && <AppText variant="error">{s.error}</AppText>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: theme.color.background },
  content: { padding: theme.space.lg, gap: theme.space.lg },
});
