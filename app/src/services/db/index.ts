// Contracts and pure helpers only. The op-sqlite implementation (openDatabase.ts) is imported
// in src/app/dependencies.ts, so features and tests never load native code.
export type { Migration, SqlExecutor, SqlRow, SqlValue } from './types';
export { runMigrations } from './migrations';
export { MIGRATIONS } from './schema';
export { createLazyExecutor } from './createLazyExecutor';
