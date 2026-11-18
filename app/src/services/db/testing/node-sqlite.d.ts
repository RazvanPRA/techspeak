// Minimal typing for Node's built-in SQLite driver, used only by Jest tests.
// (Full @types/node would clash with React Native's global types.)
declare module 'node:sqlite' {
  type Value = string | number | bigint | null | Uint8Array;
  class StatementSync {
    all(...params: Value[]): Array<Record<string, unknown>>;
  }
  export class DatabaseSync {
    constructor(path: string);
    prepare(sql: string): StatementSync;
  }
}
