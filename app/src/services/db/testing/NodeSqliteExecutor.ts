import { DatabaseSync } from 'node:sqlite';
import type { SqlExecutor, SqlRow, SqlValue } from '../types';

/** A real in-memory SQLite (Node's built-in driver) for repository tests. Jest only. */
export class NodeSqliteExecutor implements SqlExecutor {
  private readonly db = new DatabaseSync(':memory:');

  async execute(sql: string, params: readonly SqlValue[] = []): Promise<SqlRow[]> {
    return this.db.prepare(sql).all(...params) as SqlRow[];
  }
}
