import type {
  NotificationPermission,
  ReminderMessage,
  ReminderRepository,
  ReminderTime,
} from './ReminderRepository';

/** Records what would be scheduled. For tests. */
export class InMemoryReminderRepository implements ReminderRepository {
  scheduled: { time: ReminderTime; message: ReminderMessage } | null = null;

  constructor(private readonly permission: NotificationPermission = 'granted') {}

  async requestPermission(): Promise<NotificationPermission> {
    return this.permission;
  }

  async scheduleDaily(time: ReminderTime, message: ReminderMessage): Promise<void> {
    this.scheduled = { time, message };
  }

  async cancel(): Promise<void> {
    this.scheduled = null;
  }
}
