import type {
  LocalRows,
  LocalVersions,
  RemoteMerge,
  SyncBatch,
  SyncMeta,
} from '../model/types';

/** The device side of sync: the app's SQLite tables, seen as sync rows. */
export interface LocalSyncStore {
  /** Rows not uploaded yet (append-only) and vocabulary states changed since their upload. */
  listPending(): Promise<LocalRows>;
  /**
   * Marks uploaded rows. A vocabulary state is marked only if it still has the `updatedAt` that
   * was sent, so a review made during the upload stays pending.
   */
  markUploaded(batch: SyncBatch): Promise<void>;
  /** What the device already has for these downloaded rows. */
  localVersions(changes: SyncBatch): Promise<LocalVersions>;
  /** Writes downloaded rows (already merged) as uploaded, in one transaction. */
  applyRemote(merge: RemoteMerge): Promise<void>;
  readMeta(): Promise<SyncMeta>;
  writeMeta(meta: SyncMeta): Promise<void>;
}
