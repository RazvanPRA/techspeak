import { ApiError } from '@/services/api';
import {
  emptyBatch,
  SYNC_KINDS,
  type SyncBatch,
  type SyncChanges,
  type SyncKind,
} from '../model/types';
import type { SyncRepository } from '../repository/SyncRepository';

type Stored = { seq: number; record: { id: string; updatedAt?: string } };
type Cursor = Record<SyncKind, number>;

const START: Cursor = {
  shadowingAttempts: 0,
  pairAttempts: 0,
  vocabularyStates: 0,
  scenarioAnswers: 0,
  talks: 0,
};

/**
 * The server's sync rules in memory (idempotent ids, vocabulary last write wins, a `seq` per
 * table for paging), so tests can sync two "devices" through it. `offline` = no network.
 */
export class FakeSyncServer implements SyncRepository {
  offline = false;
  pushes = 0;
  private readonly seq: Cursor = { ...START };
  private readonly tables = new Map<SyncKind, Map<string, Stored>>(
    SYNC_KINDS.map(kind => [kind, new Map()]),
  );

  constructor(private readonly pageSize = 200) {}

  async push(batch: SyncBatch): Promise<void> {
    this.check();
    this.pushes++;
    for (const kind of SYNC_KINDS) {
      const table = this.tables.get(kind)!;
      for (const record of batch[kind] as Array<Stored['record']>) {
        const stored = table.get(record.id);
        const newer =
          kind === 'vocabularyStates' && stored && record.updatedAt! > stored.record.updatedAt!;
        if (stored && !newer) continue;
        table.set(record.id, { seq: ++this.seq[kind], record });
      }
    }
  }

  async pull(cursor: string | null): Promise<SyncChanges> {
    this.check();
    const since: Cursor = cursor ? JSON.parse(cursor) : { ...START };
    const next = { ...since };
    const changes = emptyBatch() as Record<SyncKind, unknown[]>;
    let hasMore = false;
    for (const kind of SYNC_KINDS) {
      const rows = [...this.tables.get(kind)!.values()]
        .filter(row => row.seq > since[kind])
        .sort((a, b) => a.seq - b.seq)
        .slice(0, this.pageSize);
      if (rows.length === this.pageSize) hasMore = true;
      changes[kind] = rows.map(row => row.record);
      next[kind] = rows.at(-1)?.seq ?? since[kind];
    }
    return { changes: changes as SyncBatch, cursor: JSON.stringify(next), hasMore };
  }

  count(kind: SyncKind): number {
    return this.tables.get(kind)!.size;
  }

  private check(): void {
    if (this.offline) throw new ApiError(0, 'Could not reach the TechSpeak server');
  }
}
