// Codegen spec of the app's own DailyReminder TurboModule
// (android/app/src/main/java/com/techspeak/reminders). Import only from NativeReminderRepository.
import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  /** Shows the notification every day at hour:minute (local time), replacing any earlier one. */
  scheduleDaily(hour: number, minute: number, title: string, body: string): Promise<void>;
  cancel(): Promise<void>;
}

// `get`, not `getEnforcing`: iOS has no implementation yet (needs a Mac).
export default TurboModuleRegistry.get<Spec>('DailyReminder');
