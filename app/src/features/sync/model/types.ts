import type { z } from 'zod';
import type {
  SyncBatchSchema,
  SyncChangesSchema,
  VocabularyStateSyncSchema,
} from './schemas';

export type SyncBatch = z.infer<typeof SyncBatchSchema>;
export type SyncChanges = z.infer<typeof SyncChangesSchema>;
export type VocabularyStateSync = z.infer<typeof VocabularyStateSyncSchema>;
export type SyncKind = keyof SyncBatch;
export type AppendOnlyKind = Exclude<SyncKind, 'vocabularyStates'>;

export const SYNC_KINDS = [
  'shadowingAttempts',
  'pairAttempts',
  'vocabularyStates',
  'scenarioAnswers',
  'talks',
] as const satisfies readonly SyncKind[];

export const APPEND_ONLY_KINDS = [
  'shadowingAttempts',
  'pairAttempts',
  'scenarioAnswers',
  'talks',
] as const satisfies readonly AppendOnlyKind[];

/** Rows that may need uploading, with their local sync state. */
export type LocalRows = {
  [K in AppendOnlyKind]: Array<SyncBatch[K][number] & { synced: boolean }>;
} & {
  vocabularyStates: Array<VocabularyStateSync & { syncedAt: string | null }>;
};

/** What the device already has, for the rows in a download. */
export type LocalVersions = {
  ids: { [K in AppendOnlyKind]: ReadonlySet<string> };
  /** Vocabulary id → local updatedAt. */
  vocabularyUpdatedAt: ReadonlyMap<string, string>;
};

/** Rows from the server to write locally. */
export type RemoteMerge = SyncBatch;

export type SyncMeta = { cursor: string | null; lastSyncedAt: string | null };

export type SyncStatus = 'idle' | 'syncing' | 'done' | 'offline' | 'error' | 'unavailable';

/** Max rows per kind in one upload (the server accepts 200). */
export const UPLOAD_BATCH_SIZE = 100;

export const emptyBatch = (): SyncBatch => ({
  shadowingAttempts: [],
  pairAttempts: [],
  vocabularyStates: [],
  scenarioAnswers: [],
  talks: [],
});
