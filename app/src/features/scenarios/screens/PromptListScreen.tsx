import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ActionRow, AppText } from '@/components/ui';
import { t } from '@/shared/i18n';
import { theme } from '@/shared/theme';
import { useScenariosDependencies } from '../dependencies/ScenariosDependencies';
import type { ScenariosStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<ScenariosStackParamList, 'ScenarioPrompts'>;

/** Every speaking prompt, grouped by topic. Tap one to answer it. */
export function PromptListScreen({ navigation }: Props) {
  const { prompts } = useScenariosDependencies();
  const groups = prompts.listGroups();
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.group}>
        <ActionRow label={t('interview.entry')} onPress={() => navigation.navigate('InterviewSetup')} />
        <ActionRow label={t('talk.entry')} onPress={() => navigation.navigate('TalkCheck')} />
      </View>
      <AppText variant="muted">{t('scenarios.listHint')}</AppText>
      {groups.map(group => (
        <View key={group.deckId + group.topic} style={styles.group}>
          <AppText variant="heading" accessibilityRole="header">
            {group.topic}
          </AppText>
          {group.prompts.map(prompt => (
            <ActionRow
              key={prompt.id}
              label={prompt.text}
              onPress={() => navigation.navigate('ScenarioAnswer', { promptId: prompt.id })}
            />
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: theme.color.background },
  content: { padding: theme.space.lg, gap: theme.space.xl },
  group: { gap: theme.space.sm },
});
