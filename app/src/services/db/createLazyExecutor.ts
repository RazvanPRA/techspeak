import type { SqlExecutor } from './types';

/**
 * Opens the database on first use and queues every statement behind it, so callers can be
 * wired synchronously. A failed open is retried on the next statement.
 */
export function createLazyExecutor(open: () => Promise<SqlExecutor>): SqlExecutor {
  let ready: Promise<SqlExecutor> | null = null;
  return {
    async execute(sql, params) {
      ready ??= open().catch(error => {
        ready = null;
        throw error;
      });
      return (await ready).execute(sql, params);
    },
  };
}
