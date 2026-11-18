import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '@/components/ui';
import { t } from '@/shared/i18n';
import { theme } from '@/shared/theme';
import { FeedbackView } from '../components/FeedbackView';
import type { ScenariosStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<ScenariosStackParamList, 'ScenarioFeedback'>;

/** Feedback on one answer, then try again or pick another question. */
export function FeedbackScreen({ navigation, route }: Props) {
  const { result } = route.params;
  const tryAgain = () => navigation.replace('ScenarioAnswer', { promptId: result.prompt.id });
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <FeedbackView result={result} />
      <Button label={t('scenarios.tryAgain')} onPress={tryAgain} />
      <Button label={t('scenarios.otherQuestion')} variant="secondary" onPress={navigation.popToTop} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: theme.color.background },
  content: { padding: theme.space.lg, gap: theme.space.lg },
});
