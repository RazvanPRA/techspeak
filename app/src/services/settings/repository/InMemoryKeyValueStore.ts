import type { KeyValueStore } from '../model/types';

/** A Map-backed store for tests. */
export class InMemoryKeyValueStore implements KeyValueStore {
  readonly values = new Map<string, string>();

  getString(key: string): string | undefined {
    return this.values.get(key);
  }

  set(key: string, value: string): void {
    this.values.set(key, value);
  }
}
