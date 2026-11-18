import type { SqlExecutor, SqlRow, SqlValue } from '../types';

const SET_VERSION = /^PRAGMA user_version = (\d+)$/;

/**
 * Records every statement and simulates `PRAGMA user_version` (with transaction rollback).
 * Optionally fails on one statement, to test error paths.
 */
export class FakeSqlExecutor implements SqlExecutor {
  readonly statements: string[] = [];
  private pendingVersion: number | null = null;

  constructor(
    public userVersion = 0,
    private readonly failOn: string | null = null,
  ) {}

  async execute(sql: string, _params?: readonly SqlValue[]): Promise<SqlRow[]> {
    this.statements.push(sql);
    if (sql === this.failOn) throw new Error('boom');
    if (sql === 'PRAGMA user_version') return [{ user_version: this.userVersion }];
    const match = SET_VERSION.exec(sql);
    if (match) this.pendingVersion = Number(match[1]);
    if (sql === 'COMMIT' && this.pendingVersion !== null) this.userVersion = this.pendingVersion;
    if (sql === 'COMMIT' || sql === 'ROLLBACK') this.pendingVersion = null;
    return [];
  }
}
