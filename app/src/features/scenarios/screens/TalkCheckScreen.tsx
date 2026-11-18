import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { ModelStatusBanner } from '@/components/speech';
import { AppText } from '@/components/ui';
import { t } from '@/shared/i18n';
import { theme } from '@/shared/theme';
import { TalkCard } from '../components/TalkCard';
import { TalkRecorder } from '../components/TalkRecorder';
import { useTalkCheck } from '../hooks/useTalkCheck';
import { compareTalks } from '../services/compareTalks.service';

const signed = (n: number) => (n > 0 ? `+${n}` : String(n));

/** Day-28 check: a 3-minute talk next to the first one (the baseline), with playback. */
export function TalkCheckScreen() {
  const s = useTalkCheck();
  const { recording } = s;
  const delta = s.baseline && s.latest ? compareTalks(s.baseline, s.latest) : null;
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <ModelStatusBanner status={s.model.status} progress={s.model.progress} onRetry={s.model.retry} />
      <AppText variant="muted">{s.baseline ? t('talk.hintAgain') : t('talk.hintFirst')}</AppText>
      <TalkRecorder
        phase={recording.phase}
        elapsed={recording.elapsed}
        canStart={s.model.status === 'ready'}
        onStart={recording.start}
        onStop={recording.finish}
      />
      {s.error && <AppText variant="error">{s.error}</AppText>}
      {s.baseline && <TalkCard title={t('talk.baseline')} talk={s.baseline} onPlay={s.play} />}
      {s.latest && <TalkCard title={t('talk.latest')} talk={s.latest} onPlay={s.play} />}
      {delta && (
        <AppText>
          {t('talk.delta', {
            wpm: signed(delta.wordsPerMinute),
            fillers: signed(delta.fillersPerMinute),
          })}
        </AppText>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: theme.color.background },
  content: { padding: theme.space.lg, gap: theme.space.lg },
});
