import { z } from 'zod';
import type { SqlExecutor, SqlRow } from '@/services/db';
import { PairAttemptSchema } from '../model/schemas';
import type { PairAttempt } from '../model/types';
import type { PairAttemptRepository } from './PairAttemptRepository';

const COLUMNS = 'pair_id, sound, mode, correct, created_at';

const RowSchema = z.object({
  pair_id: z.string(),
  sound: z.string(),
  mode: z.string(),
  correct: z.number(),
  created_at: z.string(),
});

function toAttempt(row: SqlRow): PairAttempt {
  const r = RowSchema.parse(row);
  return PairAttemptSchema.parse({
    pairId: r.pair_id,
    sound: r.sound,
    mode: r.mode,
    correct: r.correct === 1,
    createdAt: r.created_at,
  });
}

export class SqlitePairAttemptRepository implements PairAttemptRepository {
  constructor(private readonly db: SqlExecutor) {}

  async save(attempt: PairAttempt): Promise<void> {
    await this.db.execute(`INSERT INTO pair_attempts (${COLUMNS}) VALUES (?, ?, ?, ?, ?)`, [
      attempt.pairId,
      attempt.sound,
      attempt.mode,
      attempt.correct ? 1 : 0,
      attempt.createdAt,
    ]);
  }

  async listRecent(limit: number): Promise<PairAttempt[]> {
    const rows = await this.db.execute(
      `SELECT ${COLUMNS} FROM pair_attempts ORDER BY id DESC LIMIT ?`,
      [limit],
    );
    return rows.map(toAttempt);
  }
}
