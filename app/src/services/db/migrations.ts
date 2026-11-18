import type { Migration, SqlExecutor } from './types';

function assertAscending(migrations: readonly Migration[]): void {
  migrations.forEach((m, i) => {
    const previous = i === 0 ? 0 : migrations[i - 1]!.version;
    if (!Number.isInteger(m.version) || m.version <= previous) {
      throw new Error(`Migration versions must be ascending integers (got ${m.version})`);
    }
  });
}

async function readVersion(db: SqlExecutor): Promise<number> {
  const [row] = await db.execute('PRAGMA user_version');
  return Number(row?.user_version ?? 0);
}

async function apply(db: SqlExecutor, migration: Migration): Promise<void> {
  await db.execute('BEGIN');
  try {
    for (const statement of migration.statements) await db.execute(statement);
    // PRAGMA takes no bound parameters; the version is a checked integer.
    await db.execute(`PRAGMA user_version = ${migration.version}`);
    await db.execute('COMMIT');
  } catch (error) {
    await db.execute('ROLLBACK');
    throw error;
  }
}

/** Brings the schema up to the newest version. Returns the version the database is at. */
export async function runMigrations(
  db: SqlExecutor,
  migrations: readonly Migration[],
): Promise<number> {
  assertAscending(migrations);
  let version = await readVersion(db);
  for (const migration of migrations) {
    if (migration.version <= version) continue;
    await apply(db, migration);
    version = migration.version;
  }
  return version;
}
