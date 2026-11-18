import { DEFAULT_SETTINGS, SettingsSchema } from '../model/settings.schema';
import type { KeyValueStore, Settings } from '../model/types';
import type { SettingsRepository } from './SettingsRepository';

const KEY = 'settings.v1';

/** Reads stored JSON; fields missing from older data get defaults, invalid data is reset. */
function parseStored(raw: string | undefined): Settings {
  if (raw === undefined) return DEFAULT_SETTINGS;
  try {
    const stored: unknown = JSON.parse(raw);
    const fields = typeof stored === 'object' && stored !== null ? stored : {};
    const result = SettingsSchema.safeParse({ ...DEFAULT_SETTINGS, ...fields });
    return result.success ? result.data : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

/** Settings stored as one validated JSON value in a key-value store. */
export class KeyValueSettingsRepository implements SettingsRepository {
  private current: Settings;
  private readonly listeners = new Set<() => void>();

  constructor(private readonly store: KeyValueStore) {
    this.current = parseStored(store.getString(KEY));
  }

  get(): Settings {
    return this.current;
  }

  update(change: Partial<Settings>): Settings {
    const next = SettingsSchema.parse({ ...this.current, ...change });
    this.store.set(KEY, JSON.stringify(next));
    this.current = next;
    this.listeners.forEach(listener => listener());
    return next;
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}
