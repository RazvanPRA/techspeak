import type { SyncDependencies } from '../dependencies/SyncDependencies';
import { SyncUnavailableError } from '../repository/SyncRepository';
import type { SyncResult } from '../services/runSync';
import { SyncStatusStore } from '../services/SyncStatusStore';

/** For tests of other features: sync behaves as with no server configured. */
export function createTestSyncDependencies(
  clock: () => Date,
  run: () => Promise<SyncResult> = () => Promise.reject(new SyncUnavailableError()),
): SyncDependencies {
  return {
    status: new SyncStatusStore(run, async () => ({ cursor: null, lastSyncedAt: null })),
    clock,
  };
}
