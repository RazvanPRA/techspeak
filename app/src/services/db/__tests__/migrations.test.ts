import { runMigrations } from '../migrations';
import { MIGRATIONS } from '../schema';
import { FakeSqlExecutor } from '../testing/FakeSqlExecutor';
import { NodeSqliteExecutor } from '../testing/NodeSqliteExecutor';
import type { Migration } from '../types';

const two: Migration[] = [
  { version: 1, statements: ['CREATE TABLE a (x)'] },
  { version: 2, statements: ['CREATE TABLE b (y)'] },
];

describe('runMigrations', () => {
  it('applies every migration on a fresh database, each in a transaction', async () => {
    const db = new FakeSqlExecutor();
    await expect(runMigrations(db, two)).resolves.toBe(2);
    expect(db.statements).toEqual([
      'PRAGMA user_version',
      'BEGIN',
      'CREATE TABLE a (x)',
      'PRAGMA user_version = 1',
      'COMMIT',
      'BEGIN',
      'CREATE TABLE b (y)',
      'PRAGMA user_version = 2',
      'COMMIT',
    ]);
  });

  it('only applies migrations newer than the stored version', async () => {
    const db = new FakeSqlExecutor(1);
    await runMigrations(db, two);
    expect(db.statements).not.toContain('CREATE TABLE a (x)');
    expect(db.statements).toContain('CREATE TABLE b (y)');
    expect(db.userVersion).toBe(2);
  });

  it('does nothing when the database is up to date', async () => {
    const db = new FakeSqlExecutor(2);
    await expect(runMigrations(db, two)).resolves.toBe(2);
    expect(db.statements).toEqual(['PRAGMA user_version']);
  });

  it('rolls back and rethrows when a statement fails', async () => {
    const db = new FakeSqlExecutor(0, 'CREATE TABLE b (y)');
    await expect(runMigrations(db, two)).rejects.toThrow('boom');
    expect(db.statements.slice(-2)).toEqual(['CREATE TABLE b (y)', 'ROLLBACK']);
    expect(db.userVersion).toBe(1);
  });

  it('rejects migrations that are not strictly ascending', async () => {
    const bad = [two[1]!, two[0]!];
    await expect(runMigrations(new FakeSqlExecutor(), bad)).rejects.toThrow(/ascending/);
  });

  it('rejects a non-integer version', async () => {
    const bad = [{ version: 1.5, statements: [] }];
    await expect(runMigrations(new FakeSqlExecutor(), bad)).rejects.toThrow(/ascending/);
  });
});

describe('MIGRATIONS on a real SQLite database', () => {
  it('creates the three tables and is idempotent', async () => {
    const db = new NodeSqliteExecutor();
    await runMigrations(db, MIGRATIONS);
    await runMigrations(db, MIGRATIONS);
    const rows = await db.execute("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name");
    const names = rows.map(r => r.name);
    expect(names).toEqual(expect.arrayContaining(['attempts', 'pair_attempts', 'review_state']));
  });
});
