import { useSyncExternalStore } from 'react';
import { useSyncDependencies } from '../dependencies/SyncDependencies';
import { describeSyncState } from '../services/describeSyncState.service';

/** The current sync state as a caption, and a "Sync now" action that never throws. */
export function useSync() {
  const { status, clock } = useSyncDependencies();
  const state = useSyncExternalStore(status.subscribe, status.get);
  return {
    isSyncing: state.status === 'syncing',
    caption: describeSyncState(state, clock()),
    syncNow: status.syncNow,
  };
}
