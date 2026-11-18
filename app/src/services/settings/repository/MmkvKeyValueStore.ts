// Native implementation: import only from src/app/dependencies.ts (rn-bare-native-deps §3).
import { createMMKV, type MMKV } from 'react-native-mmkv';
import type { KeyValueStore } from '../model/types';

export class MmkvKeyValueStore implements KeyValueStore {
  private readonly storage: MMKV = createMMKV({ id: 'techspeak' });

  getString(key: string): string | undefined {
    return this.storage.getString(key);
  }

  set(key: string, value: string): void {
    this.storage.set(key, value);
  }
}
