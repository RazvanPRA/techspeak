export type SqlValue = string | number | null;
export type SqlRow = Readonly<Record<string, unknown>>;

/** The only thing repositories know about the database: run one statement, get rows back. */
export interface SqlExecutor {
  execute(sql: string, params?: readonly SqlValue[]): Promise<SqlRow[]>;
}

export type Migration = {
  version: number;
  statements: readonly string[];
};
