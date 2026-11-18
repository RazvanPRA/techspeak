import type { StoredChanges, SyncBatch, SyncCursor } from '../sync.types.js';

/** Where the synced copy of the app's progress lives. */
export interface SyncStore {
  /**
   * Idempotent: rows whose id is already stored are skipped. A vocabulary state replaces the
   * stored one only when its `updatedAt` is newer (last write wins), and then gets a new `seq`.
   */
  save(batch: SyncBatch): Promise<void>;
  /** Up to `limit` rows per table with `seq` above the cursor, oldest first. */
  changesSince(cursor: SyncCursor, limit: number): Promise<StoredChanges>;
}

export const SYNC_STORE = Symbol('SyncStore');
