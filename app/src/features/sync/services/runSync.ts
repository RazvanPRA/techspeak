import { SYNC_KINDS, type SyncBatch } from '../model/types';
import type { LocalSyncStore } from '../repository/LocalSyncStore';
import type { SyncRepository } from '../repository/SyncRepository';
import { mergeRemote } from './mergeRemote.service';
import { selectUnsynced } from './selectUnsynced.service';

export type SyncResult = { uploaded: number; downloaded: number; lastSyncedAt: string };

export type SyncDeps = {
  local: LocalSyncStore;
  remote: SyncRepository;
  clock: () => Date;
};

/** A server answering hasMore forever must not loop forever. */
const MAX_PAGES = 1000;

const count = (batch: SyncBatch) => SYNC_KINDS.reduce((n, kind) => n + batch[kind].length, 0);

/**
 * Upload everything pending, then download everything new. Each step is saved as it goes, so a
 * sync cut off half-way (offline) loses nothing and simply continues next time.
 */
export async function runSync({ local, remote, clock }: SyncDeps): Promise<SyncResult> {
  let uploaded = 0;
  for (const batch of selectUnsynced(await local.listPending())) {
    await remote.push(batch);
    await local.markUploaded(batch);
    uploaded += count(batch);
  }

  let downloaded = 0;
  let { cursor } = await local.readMeta();
  for (let page = 0; page < MAX_PAGES; page++) {
    const { changes, cursor: next, hasMore } = await remote.pull(cursor);
    const merge = mergeRemote(changes, await local.localVersions(changes));
    if (count(merge) > 0) await local.applyRemote(merge);
    downloaded += count(merge);
    cursor = next;
    const { lastSyncedAt } = await local.readMeta();
    await local.writeMeta({ cursor, lastSyncedAt });
    if (!hasMore) break;
  }

  const lastSyncedAt = clock().toISOString();
  await local.writeMeta({ cursor, lastSyncedAt });
  return { uploaded, downloaded, lastSyncedAt };
}

/** Runs one sync at a time: a second call while one is running gets the same result. */
export function createSyncRunner(deps: SyncDeps): () => Promise<SyncResult> {
  let running: Promise<SyncResult> | null = null;
  return () => {
    running ??= runSync(deps).finally(() => {
      running = null;
    });
    return running;
  };
}

