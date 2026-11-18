import { act, renderHook } from '@testing-library/react-native';
import { useSettings } from '../hooks/useSettings';
import { DEFAULT_SETTINGS } from '../model/settings.schema';
import { InMemoryKeyValueStore } from '../repository/InMemoryKeyValueStore';
import { KeyValueSettingsRepository } from '../repository/KeyValueSettingsRepository';

const KEY = 'settings.v1';

describe('KeyValueSettingsRepository', () => {
  it('starts with the defaults on an empty store', () => {
    const repo = new KeyValueSettingsRepository(new InMemoryKeyValueStore());
    expect(repo.get()).toEqual(DEFAULT_SETTINGS);
  });

  it('saves a change and reads it back in a new instance', () => {
    const store = new InMemoryKeyValueStore();
    new KeyValueSettingsRepository(store).update({ speechRate: 0.7 });
    expect(new KeyValueSettingsRepository(store).get().speechRate).toBe(0.7);
  });

  it('fills fields missing from older stored data with defaults', () => {
    const store = new InMemoryKeyValueStore();
    store.set(KEY, JSON.stringify({ speechRate: 0.8 }));
    expect(new KeyValueSettingsRepository(store).get()).toEqual({
      ...DEFAULT_SETTINGS,
      speechRate: 0.8,
    });
  });

  it('loads settings saved before the voice picker with the system voice', () => {
    const store = new InMemoryKeyValueStore();
    const old: Record<string, unknown> = { ...DEFAULT_SETTINGS, speechRate: 0.9 };
    delete old.voiceId;
    store.set(KEY, JSON.stringify(old));
    const loaded = new KeyValueSettingsRepository(store).get();
    expect(loaded.voiceId).toBeNull();
    expect(loaded.speechRate).toBe(0.9);
  });

  it('saves the chosen voice and reads it back', () => {
    const store = new InMemoryKeyValueStore();
    new KeyValueSettingsRepository(store).update({ voiceId: 'en-gb-x-1' });
    expect(new KeyValueSettingsRepository(store).get().voiceId).toBe('en-gb-x-1');
  });

  it('rejects an empty voice id', () => {
    const repo = new KeyValueSettingsRepository(new InMemoryKeyValueStore());
    expect(() => repo.update({ voiceId: '' })).toThrow();
    expect(repo.get().voiceId).toBeNull();
  });

  it('falls back to the defaults on invalid or corrupt data', () => {
    const store = new InMemoryKeyValueStore();
    store.set(KEY, JSON.stringify({ speechRate: 9 }));
    expect(new KeyValueSettingsRepository(store).get()).toEqual(DEFAULT_SETTINGS);
    store.set(KEY, '{not json');
    expect(new KeyValueSettingsRepository(store).get()).toEqual(DEFAULT_SETTINGS);
    store.set(KEY, 'null');
    expect(new KeyValueSettingsRepository(store).get()).toEqual(DEFAULT_SETTINGS);
  });

  it('rejects an invalid change and keeps the old value', () => {
    const repo = new KeyValueSettingsRepository(new InMemoryKeyValueStore());
    expect(() => repo.update({ dailyGoalMinutes: 0 })).toThrow();
    expect(repo.get().dailyGoalMinutes).toBe(DEFAULT_SETTINGS.dailyGoalMinutes);
  });

  it('notifies subscribers until they unsubscribe', () => {
    const repo = new KeyValueSettingsRepository(new InMemoryKeyValueStore());
    const listener = jest.fn();
    const unsubscribe = repo.subscribe(listener);
    repo.update({ speechRate: 0.6 });
    unsubscribe();
    repo.update({ speechRate: 0.9 });
    expect(listener).toHaveBeenCalledTimes(1);
  });
});

describe('useSettings', () => {
  it('re-renders with the updated settings', async () => {
    const repo = new KeyValueSettingsRepository(new InMemoryKeyValueStore());
    const { result } = await renderHook(() => useSettings(repo));
    await act(() => {
      result.current.update({ dailyGoalMinutes: 20 });
    });
    expect(result.current.settings.dailyGoalMinutes).toBe(20);
  });
});
