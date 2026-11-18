import type { Settings } from '../model/types';

/** User settings and the streak. Reads are synchronous so screens can render them at once. */
export interface SettingsRepository {
  get(): Settings;
  /** Merges the change, saves it and notifies subscribers. Throws on an invalid value. */
  update(change: Partial<Settings>): Settings;
  /** Returns an unsubscribe function. */
  subscribe(listener: () => void): () => void;
}
