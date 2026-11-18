import {
  APPEND_ONLY_KINDS,
  emptyBatch,
  type LocalRows,
  SYNC_KINDS,
  type SyncBatch,
  UPLOAD_BATCH_SIZE,
} from '../model/types';

/** A vocabulary state needs uploading until the server has its current version. */
export const isVocabularyPending = (updatedAt: string, syncedAt: string | null): boolean =>
  syncedAt === null || syncedAt < updatedAt;

/** What still needs uploading, split into batches of at most `size` rows per kind. */
export function selectUnsynced(local: LocalRows, size = UPLOAD_BATCH_SIZE): SyncBatch[] {
  const pending = emptyBatch() as Record<keyof SyncBatch, unknown[]>;
  for (const kind of APPEND_ONLY_KINDS) {
    pending[kind] = local[kind].filter(r => !r.synced).map(({ synced: _s, ...record }) => record);
  }
  pending.vocabularyStates = local.vocabularyStates
    .filter(v => isVocabularyPending(v.updatedAt, v.syncedAt))
    .map(({ syncedAt: _s, ...record }) => record);

  const longest = Math.max(...SYNC_KINDS.map(kind => pending[kind].length));
  const batches: SyncBatch[] = [];
  for (let start = 0; start < longest; start += size) {
    const batch = emptyBatch() as Record<keyof SyncBatch, unknown[]>;
    for (const kind of SYNC_KINDS) batch[kind] = pending[kind].slice(start, start + size);
    batches.push(batch as SyncBatch);
  }
  return batches;
}
