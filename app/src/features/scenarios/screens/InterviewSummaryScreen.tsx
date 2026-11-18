import React, { useMemo } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppText, Button, TitledCard } from '@/components/ui';
import { t } from '@/shared/i18n';
import { theme } from '@/shared/theme';
import { IssueCard } from '../components/IssueCard';
import type { ScenariosStackParamList } from '../navigation/types';
import { describeIssue } from '../services/describeIssue.service';
import { summarizeInterview } from '../services/summarizeInterview.service';

type Props = NativeStackScreenProps<ScenariosStackParamList, 'InterviewSummary'>;

/** The 3 most important things to improve, then each question with its score. */
export function InterviewSummaryScreen({ navigation, route }: Props) {
  const { results } = route.params;
  const issues = useMemo(() => summarizeInterview(results).map(describeIssue), [results]);
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <AppText variant="title" accessibilityRole="header">
        {t('interview.summaryTitle')}
      </AppText>
      {issues.length === 0 && <AppText>{t('interview.noIssues')}</AppText>}
      {issues.map((text, i) => (
        <IssueCard key={text.title} rank={i + 1} text={text} />
      ))}
      <TitledCard title={t('interview.questionsTitle')}>
        {results.map(r => (
          <AppText key={r.prompt.id}>
            {t('interview.questionScore', {
              question: r.prompt.text,
              score: r.feedback ? String(r.feedback.overallScore) : '–',
            })}
          </AppText>
        ))}
      </TitledCard>
      <Button label={t('interview.again')} onPress={() => navigation.replace('InterviewSetup')} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: theme.color.background },
  content: { padding: theme.space.lg, gap: theme.space.lg },
});
