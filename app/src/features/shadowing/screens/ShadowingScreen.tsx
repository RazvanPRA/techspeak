import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/ui';
import { t } from '@/shared/i18n';
import { theme } from '@/shared/theme';
import { AttemptResultPanel } from '../components/AttemptResultPanel';
import { HoldToRecordButton } from '../components/HoldToRecordButton';
import { ModelStatusBanner } from '../components/ModelStatusBanner';
import { PlaybackControls } from '../components/PlaybackControls';
import { SentenceCard } from '../components/SentenceCard';
import { WordDetailSheet } from '../components/WordDetailSheet';
import { useShadowingScreen } from '../hooks/useShadowingScreen';

export function ShadowingScreen() {
  const s = useShadowingScreen();

  if (!s.current.deck) {
    return (
      <View style={styles.centered}>
        <AppText variant="muted">{t('shadowing.noDeck')}</AppText>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <ModelStatusBanner status={s.model.status} progress={s.model.progress} onRetry={s.model.retry} />
      <AppText variant="caption">
        {t('shadowing.progress', { current: s.current.index + 1, total: s.current.total })}
      </AppText>
      <SentenceCard tokens={s.current.tokens} statuses={s.statuses} onWordPress={s.word.select} />
      <PlaybackControls actions={s.actions} canCompare={s.canCompare} disabled={s.isBusy} />
      <HoldToRecordButton
        phase={s.record.phase}
        disabled={s.model.status !== 'ready'}
        onStart={s.record.start}
        onStop={s.record.stop}
      />
      {s.error && <AppText style={styles.error}>{s.error}</AppText>}
      {s.summary && <AttemptResultPanel result={s.summary} onNext={s.next} />}
      <WordDetailSheet token={s.selectedToken} onClose={s.word.close} onListen={s.word.listen} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: theme.color.background },
  content: { padding: theme.space.lg, gap: theme.space.lg },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  error: { color: theme.color.wrong },
});
