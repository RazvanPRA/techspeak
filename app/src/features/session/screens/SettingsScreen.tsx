import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { AppText, SegmentedControl, Stepper, TitledCard } from '@/components/ui';
import { SyncRow } from '@/features/sync';
import { t } from '@/shared/i18n';
import { theme } from '@/shared/theme';
import { VoicePicker } from '../components/VoicePicker';
import { useReminderSettings } from '../hooks/useReminderSettings';
import { usePracticeSettings } from '../hooks/usePracticeSettings';
import { REMINDER_STEPS } from '../model/constants';
import { formatTimeOfDay } from '../services/shiftReminderTime.service';

const ON_OFF = [
  { key: 'on' as const, label: t('settings.on') },
  { key: 'off' as const, label: t('settings.off') },
];

/** Speech rate, daily goal, backup (sync), the daily reminder and the model voice. */
export function SettingsScreen() {
  const p = usePracticeSettings();
  const r = useReminderSettings();
  const time = formatTimeOfDay(r.reminder);
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <TitledCard title={t('settings.practiceTitle')}>
        <Stepper
          label={t('settings.speechRate')}
          value={p.speechRate.toFixed(1)}
          decrementLabel={t('settings.slower')}
          incrementLabel={t('settings.faster')}
          canDecrement={p.rate.canSlower}
          canIncrement={p.rate.canFaster}
          onDecrement={() => p.changeRate(-1)}
          onIncrement={() => p.changeRate(1)}
        />
        <Stepper
          label={t('settings.dailyGoal')}
          value={t('session.minutes', { minutes: p.dailyGoalMinutes })}
          decrementLabel={t('settings.less')}
          incrementLabel={t('settings.more')}
          canDecrement={p.goal.canLess}
          canIncrement={p.goal.canMore}
          onDecrement={() => p.changeGoal(-1)}
          onIncrement={() => p.changeGoal(1)}
        />
      </TitledCard>
      <TitledCard title={t('sync.section')}>
        <SyncRow />
      </TitledCard>
      <TitledCard title={t('settings.reminderSection')}>
        <SegmentedControl
          segments={ON_OFF}
          selected={r.reminder.enabled ? 'on' : 'off'}
          onChange={key => r.toggle(key === 'on')}
        />
        <Stepper
          label={t('settings.reminderHour')}
          value={time}
          decrementLabel={t('settings.hourEarlier')}
          incrementLabel={t('settings.hourLater')}
          onDecrement={() => r.shift(-REMINDER_STEPS.hour)}
          onIncrement={() => r.shift(REMINDER_STEPS.hour)}
        />
        <Stepper
          label={t('settings.reminderMinute')}
          value={time}
          decrementLabel={t('settings.minutesEarlier')}
          incrementLabel={t('settings.minutesLater')}
          onDecrement={() => r.shift(-REMINDER_STEPS.minute)}
          onIncrement={() => r.shift(REMINDER_STEPS.minute)}
        />
        {r.error && <AppText variant="error">{r.error}</AppText>}
      </TitledCard>
      {/* Last: the voice list can be long. */}
      <TitledCard title={t('settings.voiceSection')}>
        <VoicePicker />
      </TitledCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: theme.color.background },
  content: { padding: theme.space.lg, gap: theme.space.lg },
});
