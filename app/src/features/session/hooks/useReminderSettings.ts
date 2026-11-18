import { useCallback, useState } from 'react';
import type { ReminderSettings } from '@/services/settings';
import { useSettings } from '@/services/settings';
import { t } from '@/shared/i18n';
import { errorMessage } from '@/shared/utils';
import { useSessionDependencies } from '../dependencies/SessionDependencies';
import { shiftReminderTime } from '../services/shiftReminderTime.service';

/** Turns the daily reminder on/off and moves its time; keeps the native schedule in sync. */
export function useReminderSettings() {
  const { settings: repo, reminders } = useSessionDependencies();
  const { settings, update } = useSettings(repo);
  const [error, setError] = useState<string | null>(null);
  const reminder = settings.reminder;

  const apply = useCallback(
    async (next: ReminderSettings) => {
      setError(null);
      try {
        if (next.enabled && (await reminders.requestPermission()) === 'denied') {
          setError(t('settings.notificationsDenied'));
          return;
        }
        if (next.enabled) {
          const message = { title: t('settings.reminderTitle'), body: t('settings.reminderBody') };
          await reminders.scheduleDaily(next, message);
        } else {
          await reminders.cancel();
        }
        update({ reminder: next });
      } catch (e) {
        setError(errorMessage(e));
      }
    },
    [reminders, update],
  );

  const toggle = useCallback(
    (enabled: boolean) => apply({ ...reminder, enabled }),
    [apply, reminder],
  );
  const shift = useCallback(
    (minutes: number) => apply({ ...reminder, ...shiftReminderTime(reminder, minutes) }),
    [apply, reminder],
  );
  return { reminder, toggle, shift, error };
}
