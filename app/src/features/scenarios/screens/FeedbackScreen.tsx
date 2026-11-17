import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '@/components/ui';
import { t } from '@/shared/i18n';
import { theme } from '@/shared/theme';
import { BetterWayCard } from '../components/BetterWayCard';
import { FeedbackSummary } from '../components/FeedbackSummary';
import { FluencyCard } from '../components/FluencyCard';
import { PhrasesCard } from '../components/PhrasesCard';
import { PronunciationCard } from '../components/PronunciationCard';
import { TranscriptCard } from '../components/TranscriptCard';
import { VocabularyCard } from '../components/VocabularyCard';
import type { ScenariosStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<ScenariosStackParamList, 'ScenarioFeedback'>;

/** Server feedback on the answer, or the on-device fluency summary when it is missing. */
export function FeedbackScreen({ navigation, route }: Props) {
  const { result } = route.params;
  const { feedback, localFluency } = result;
  const fluency = feedback?.fluency ?? { ...localFluency, tip: null };
  const tryAgain = () => navigation.replace('ScenarioAnswer', { promptId: result.prompt.id });
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <FeedbackSummary result={result} />
      <TranscriptCard transcript={result.transcript} />
      {feedback && (
        <BetterWayCard corrections={feedback.corrections} improvedAnswer={feedback.improvedAnswer} />
      )}
      {feedback && <PronunciationCard tips={feedback.pronunciation} />}
      <FluencyCard
        wordsPerMinute={fluency.wordsPerMinute}
        fillerCount={fluency.fillerCount}
        fillers={fluency.fillers}
        tip={fluency.tip}
      />
      {feedback && <VocabularyCard vocabulary={feedback.vocabulary} />}
      {feedback && <PhrasesCard phrases={feedback.phrasesToReuse} />}
      <Button label={t('scenarios.tryAgain')} onPress={tryAgain} />
      <Button label={t('scenarios.otherQuestion')} variant="secondary" onPress={navigation.popToTop} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: theme.color.background },
  content: { padding: theme.space.lg, gap: theme.space.lg },
});
