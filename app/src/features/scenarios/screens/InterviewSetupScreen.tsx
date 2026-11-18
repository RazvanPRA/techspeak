import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppText, Button, SelectableRow } from '@/components/ui';
import { t } from '@/shared/i18n';
import { theme } from '@/shared/theme';
import { useInterviewSetup } from '../hooks/useInterviewSetup';
import type { ScenariosStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<ScenariosStackParamList, 'InterviewSetup'>;

/** Pick the decks, then answer 5 random questions in a row. */
export function InterviewSetupScreen({ navigation }: Props) {
  const s = useInterviewSetup();
  const start = () => navigation.replace('Interview', { promptIds: s.pickQuestions() });
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <AppText variant="muted">{t('interview.setupHint')}</AppText>
      {s.decks.map(([deckId, topic]) => (
        <SelectableRow
          key={deckId}
          label={topic}
          selected={s.selected.includes(deckId)}
          onPress={() => s.toggle(deckId)}
        />
      ))}
      <Button label={t('interview.start')} onPress={start} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: theme.color.background },
  content: { padding: theme.space.lg, gap: theme.space.sm },
});
