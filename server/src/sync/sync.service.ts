import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { formatCursor, parseCursor } from './cursor.js';
import { SYNC_STORE, type SyncStore } from './store/sync-store.js';
import {
  SYNC_KINDS,
  SYNC_PAGE_SIZE,
  type SyncBatch,
  type SyncCursor,
} from './sync.types.js';

export type SyncChanges = {
  changes: SyncBatch;
  /** Pass back as `since` to get only what came after this page. */
  cursor: string;
  /** True when a table filled its page: call again with the new cursor. */
  hasMore: boolean;
};

/** Upload = idempotent save. Download = rows after the cursor, one page per table. */
@Injectable()
export class SyncService {
  constructor(
    @Inject(SYNC_STORE) private readonly store: SyncStore,
    private readonly pageSize = SYNC_PAGE_SIZE,
  ) {}

  async upload(batch: SyncBatch): Promise<{ received: number }> {
    await this.store.save(batch);
    const received = SYNC_KINDS.reduce((n, kind) => n + batch[kind].length, 0);
    return { received };
  }

  async download(since: string | undefined): Promise<SyncChanges> {
    const cursor = parseCursor(since);
    if (!cursor)
      throw new BadRequestException(`Invalid sync cursor "${since}"`);
    const stored = await this.store.changesSince(cursor, this.pageSize);
    const next: SyncCursor = { ...cursor };
    let hasMore = false;
    const changes = {} as Record<string, unknown[]>;
    for (const kind of SYNC_KINDS) {
      const rows = stored[kind];
      if (rows.length >= this.pageSize) hasMore = true;
      next[kind] = rows.reduce(
        (max, row) => Math.max(max, row.seq),
        next[kind],
      );
      changes[kind] = rows.map(({ seq: _seq, ...record }) => record);
    }
    return {
      changes: changes as SyncBatch,
      cursor: formatCursor(next),
      hasMore,
    };
  }
}
