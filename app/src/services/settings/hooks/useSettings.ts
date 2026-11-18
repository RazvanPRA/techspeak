import { useCallback, useSyncExternalStore } from 'react';
import type { Settings } from '../model/types';
import type { SettingsRepository } from '../repository/SettingsRepository';

/** The current settings (re-renders on every change) and a function to change them. */
export function useSettings(repository: SettingsRepository) {
  const subscribe = useCallback(
    (listener: () => void) => repository.subscribe(listener),
    [repository],
  );
  const settings = useSyncExternalStore(subscribe, () => repository.get());
  const update = useCallback(
    (change: Partial<Settings>) => repository.update(change),
    [repository],
  );
  return { settings, update };
}
