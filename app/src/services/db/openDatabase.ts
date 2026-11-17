// Native implementation: import only from src/app/dependencies.ts (rn-bare-native-deps §3).
import { open, type DB } from '@op-engineering/op-sqlite';
import { runMigrations } from './migrations';
import { MIGRATIONS } from './schema';
import type { SqlExecutor, SqlRow, SqlValue } from './types';

class OpSqliteExecutor implements SqlExecutor {
  constructor(private readonly db: DB) {}

  async execute(sql: string, params: readonly SqlValue[] = []): Promise<SqlRow[]> {
    const result = await this.db.execute(sql, [...params]);
    return result.rows;
  }
}

/** Opens the app database (op-sqlite) and brings its schema up to date. */
export async function openDatabase(name = 'techspeak.db'): Promise<SqlExecutor> {
  const db = new OpSqliteExecutor(open({ name }));
  await runMigrations(db, MIGRATIONS);
  return db;
}
