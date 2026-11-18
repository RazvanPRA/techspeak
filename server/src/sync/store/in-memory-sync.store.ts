import {
  type StoredChanges,
  SYNC_KINDS,
  type SyncBatch,
  type SyncCursor,
  type SyncKind,
} from '../sync.types.js';
import type { SyncStore } from './sync-store.js';

type Row = { id: string; seq: number; updatedAt?: string };

/** Same rules as PrismaSyncStore, in memory. For unit and e2e tests. */
export class InMemorySyncStore implements SyncStore {
  private seq = 0;
  private readonly tables = new Map<SyncKind, Map<string, Row>>(
    SYNC_KINDS.map((kind) => [kind, new Map()]),
  );

  async save(batch: SyncBatch): Promise<void> {
    for (const kind of SYNC_KINDS) {
      const table = this.tables.get(kind)!;
      for (const record of batch[kind] as ReadonlyArray<Omit<Row, 'seq'>>) {
        const stored = table.get(record.id);
        const newer =
          kind === 'vocabularyStates' &&
          stored !== undefined &&
          record.updatedAt! > stored.updatedAt!;
        if (stored && !newer) continue;
        table.set(record.id, { ...record, seq: ++this.seq });
      }
    }
  }

  async changesSince(
    cursor: SyncCursor,
    limit: number,
  ): Promise<StoredChanges> {
    const pick = (kind: SyncKind) =>
      [...this.tables.get(kind)!.values()]
        .filter((row) => row.seq > cursor[kind])
        .sort((a, b) => a.seq - b.seq)
        .slice(0, limit);
    return Object.fromEntries(
      SYNC_KINDS.map((kind) => [kind, pick(kind)]),
    ) as unknown as StoredChanges;
  }
}
