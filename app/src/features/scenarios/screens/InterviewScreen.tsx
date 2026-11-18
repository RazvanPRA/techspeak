import React, { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppText, EmptyState } from '@/components/ui';
import { t } from '@/shared/i18n';
import { theme } from '@/shared/theme';
import { AnswerPanel } from '../components/AnswerPanel';
import { useInterview } from '../hooks/useInterview';
import type { AnswerResult } from '../model/types';
import type { ScenariosStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<ScenariosStackParamList, 'Interview'>;

/** One timed answer per question; the summary comes after the last one. */
export function InterviewScreen({ navigation, route }: Props) {
  const onFinished = useCallback(
    (results: AnswerResult[]) => navigation.replace('InterviewSummary', { results }),
    [navigation],
  );
  const s = useInterview(route.params.promptIds, onFinished);
  if (!s.prompt) return <EmptyState message={t('scenarios.unknownPrompt')} />;
  return (
    <View style={styles.screen}>
      <AppText variant="caption" style={styles.progress}>
        {t('interview.progress', { current: s.index + 1, total: s.total })}
      </AppText>
      <AnswerPanel key={s.prompt.id} prompt={s.prompt} onDone={s.onAnswered} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.color.background },
  progress: { paddingHorizontal: theme.space.lg, paddingTop: theme.space.md },
});
