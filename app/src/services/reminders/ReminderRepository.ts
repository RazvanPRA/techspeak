export type ReminderTime = { hour: number; minute: number };
export type ReminderMessage = { title: string; body: string };
export type NotificationPermission = 'granted' | 'denied';

/** A local daily notification that reminds me to practise. */
export interface ReminderRepository {
  requestPermission(): Promise<NotificationPermission>;
  /** Replaces any reminder scheduled before. */
  scheduleDaily(time: ReminderTime, message: ReminderMessage): Promise<void>;
  cancel(): Promise<void>;
}
