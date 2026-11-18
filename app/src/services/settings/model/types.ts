import type { z } from 'zod';
import type { ReminderSchema, SettingsSchema, StreakSchema } from './settings.schema';

export type Settings = z.infer<typeof SettingsSchema>;
export type Streak = z.infer<typeof StreakSchema>;
export type ReminderSettings = z.infer<typeof ReminderSchema>;

/** The part of a key-value store the settings need (MMKV in the app, a Map in tests). */
export interface KeyValueStore {
  getString(key: string): string | undefined;
  set(key: string, value: string): void;
}
