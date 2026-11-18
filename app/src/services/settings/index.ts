// Contracts, pure parts and hooks only. MmkvKeyValueStore (native) is imported in
// src/app/dependencies.ts, so features and tests never load native code.
export type { KeyValueStore, ReminderSettings, Settings, Streak } from './model/types';
export {
  DAILY_GOAL_RANGE,
  DEFAULT_SETTINGS,
  MAX_SPEECH_RATE,
  MIN_SPEECH_RATE,
} from './model/settings.schema';
export type { SettingsRepository } from './repository/SettingsRepository';
export { KeyValueSettingsRepository } from './repository/KeyValueSettingsRepository';
export { InMemoryKeyValueStore } from './repository/InMemoryKeyValueStore';
export { useSettings } from './hooks/useSettings';
