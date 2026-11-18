import type { SqlExecutor, SqlRow, SqlValue } from '@/services/db';
import {
  APPEND_ONLY_KINDS,
  type LocalRows,
  type LocalVersions,
  type RemoteMerge,
  type SyncBatch,
  type SyncMeta,
} from '../model/types';
import type { LocalSyncStore } from './LocalSyncStore';
import {
  fromRow,
  INSERT_REMOTE,
  SELECT_PENDING,
  TABLES,
  UPSERT_REMOTE_VOCABULARY,
  vocabularyId,
} from './sqliteRows';

const placeholders = (n: number) => Array.from({ length: n }, () => '?').join(', ');

/** Sync rows over the app's SQLite tables (migration v3 added sync_id / synced / updated_at). */
export class SqliteLocalSyncStore implements LocalSyncStore {
  constructor(private readonly db: SqlExecutor) {}

  async listPending(): Promise<LocalRows> {
    const read = async <T>(sql: string, map: (row: SqlRow) => T) =>
      (await this.db.execute(sql)).map(map);
    return {
      shadowingAttempts: await read(SELECT_PENDING.shadowingAttempts, fromRow.shadowingAttempts),
      pairAttempts: await read(SELECT_PENDING.pairAttempts, fromRow.pairAttempts),
      scenarioAnswers: await read(SELECT_PENDING.scenarioAnswers, fromRow.scenarioAnswers),
      talks: await read(SELECT_PENDING.talks, fromRow.talks),
      vocabularyStates: await read(SELECT_PENDING.vocabularyStates, fromRow.vocabularyStates),
    };
  }

  async markUploaded(batch: SyncBatch): Promise<void> {
    for (const kind of APPEND_ONLY_KINDS) {
      const ids = batch[kind].map(r => r.id);
      if (ids.length === 0) continue;
      await this.db.execute(
        `UPDATE ${TABLES[kind]} SET synced = 1 WHERE sync_id IN (${placeholders(ids.length)})`,
        ids,
      );
    }
    for (const v of batch.vocabularyStates) {
      await this.db.execute(
        `UPDATE review_state SET synced_at = ?
          WHERE deck_id = ? AND term = ? AND updated_at = ?`,
        [v.updatedAt, v.deckId, v.term, v.updatedAt],
      );
    }
  }

  async localVersions(changes: SyncBatch): Promise<LocalVersions> {
    const ids = {} as Record<(typeof APPEND_ONLY_KINDS)[number], Set<string>>;
    for (const kind of APPEND_ONLY_KINDS) {
      const wanted = changes[kind].map(r => r.id);
      const rows = wanted.length
        ? await this.db.execute(
            `SELECT sync_id FROM ${TABLES[kind]} WHERE sync_id IN (${placeholders(wanted.length)})`,
            wanted,
          )
        : [];
      ids[kind] = new Set(rows.map(r => String(r.sync_id)));
    }
    const wanted = changes.vocabularyStates.map(v => v.id);
    const rows = wanted.length
      ? await this.db.execute(
          `SELECT deck_id, term, updated_at FROM review_state
            WHERE (deck_id || ':' || term) IN (${placeholders(wanted.length)})`,
          wanted,
        )
      : [];
    const vocabularyUpdatedAt = new Map(
      rows.map(r => [vocabularyId(String(r.deck_id), String(r.term)), String(r.updated_at ?? '')]),
    );
    return { ids, vocabularyUpdatedAt };
  }

  async applyRemote(merge: RemoteMerge): Promise<void> {
    await this.db.execute('BEGIN');
    try {
      await this.insertAppendOnly(merge);
      for (const v of merge.vocabularyStates) {
        await this.db.execute(UPSERT_REMOTE_VOCABULARY, [
          v.deckId,
          v.term,
          v.ease,
          v.interval,
          v.repetitions,
          v.dueAt,
          v.lapses,
          v.updatedAt,
          v.updatedAt, // came from the server, so it is already uploaded
        ]);
      }
      await this.db.execute('COMMIT');
    } catch (error) {
      await this.db.execute('ROLLBACK');
      throw error;
    }
  }

  async readMeta(): Promise<SyncMeta> {
    const rows = await this.db.execute('SELECT key, value FROM sync_meta');
    const value = (key: string) => {
      const found = rows.find(r => r.key === key)?.value;
      return typeof found === 'string' ? found : null;
    };
    return { cursor: value('cursor'), lastSyncedAt: value('lastSyncedAt') };
  }

  async writeMeta(meta: SyncMeta): Promise<void> {
    for (const [key, value] of Object.entries(meta)) {
      if (value === null) await this.db.execute('DELETE FROM sync_meta WHERE key = ?', [key]);
      else await this.db.execute('INSERT OR REPLACE INTO sync_meta (key, value) VALUES (?, ?)', [key, value]);
    }
  }

  private async insertAppendOnly(merge: RemoteMerge): Promise<void> {
    const run = async (sql: string, rows: SqlValue[][]) => {
      for (const params of rows) await this.db.execute(sql, params);
    };
    const { shadowingAttempts, pairAttempts, scenarioAnswers, talks } = INSERT_REMOTE;
    await run(shadowingAttempts.sql, merge.shadowingAttempts.map(shadowingAttempts.values));
    await run(pairAttempts.sql, merge.pairAttempts.map(pairAttempts.values));
    await run(scenarioAnswers.sql, merge.scenarioAnswers.map(scenarioAnswers.values));
    await run(talks.sql, merge.talks.map(talks.values));
  }
}
