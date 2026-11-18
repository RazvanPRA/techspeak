// Native implementation: import only from src/app/dependencies.ts (rn-bare-native-deps §3).
import { PermissionsAndroid, Platform } from 'react-native';
import NativeDailyReminder from './native/NativeDailyReminder';
import type {
  NotificationPermission,
  ReminderMessage,
  ReminderRepository,
  ReminderTime,
} from './ReminderRepository';

/** Android 13+ asks for POST_NOTIFICATIONS; older versions grant it at install. */
const NEEDS_RUNTIME_PERMISSION = Platform.OS === 'android' && Number(Platform.Version) >= 33;

function nativeModule() {
  if (!NativeDailyReminder) throw new Error('Daily reminders are not available on this device');
  return NativeDailyReminder;
}

/** The app's own DailyReminder TurboModule (AlarmManager + NotificationManager on Android). */
export class NativeReminderRepository implements ReminderRepository {
  async requestPermission(): Promise<NotificationPermission> {
    if (!NEEDS_RUNTIME_PERMISSION) return 'granted';
    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
    return result === PermissionsAndroid.RESULTS.GRANTED ? 'granted' : 'denied';
  }

  scheduleDaily(time: ReminderTime, message: ReminderMessage): Promise<void> {
    return nativeModule().scheduleDaily(time.hour, time.minute, message.title, message.body);
  }

  cancel(): Promise<void> {
    return nativeModule().cancel();
  }
}
