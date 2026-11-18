import React, { useCallback } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ActionRow, AppText, Button, Card, EmptyState } from '@/components/ui';
import { t } from '@/shared/i18n';
import { theme } from '@/shared/theme';
import { PlanCard } from '../components/PlanCard';
import { useTodayPlan } from '../hooks/useTodayPlan';
import { streakText } from '../services/describeBlock.service';
import type { SessionStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<SessionStackParamList, 'Today'>;

/** The streak, today's plan and Start. */
export function TodayScreen({ navigation }: Props) {
  const { plan, status, streak, refresh } = useTodayPlan();
  // Practice in the other tabs changes due cards and weak sounds.
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );
  if (status === 'error') return <EmptyState message={t('session.loadError')} />;
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Card>
        <AppText variant="title" accessibilityRole="header">
          {streakText(streak)}
        </AppText>
      </Card>
      {plan && <PlanCard plan={plan} />}
      <Button
        label={t('session.start')}
        disabled={!plan}
        onPress={() => plan && navigation.navigate('SessionRun', { plan })}
      />
      <ActionRow label={t('settings.title')} onPress={() => navigation.navigate('Settings')} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: theme.color.background },
  content: { padding: theme.space.lg, gap: theme.space.lg },
});
