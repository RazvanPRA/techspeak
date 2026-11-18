import type { SqlExecutor, SqlRow } from '@/services/db';
import {
  ScenarioAnswerRecordSchema,
  type ScenarioAnswerRecord,
} from '../model/records';
import type { ScenarioAnswerRepository } from './ScenarioAnswerRepository';

const COLUMNS =
  'prompt_id, deck_id, duration_s, wpm, fillers, score, transcript, created_at';

function toRecord(row: SqlRow): ScenarioAnswerRecord {
  return ScenarioAnswerRecordSchema.parse({
    promptId: row.prompt_id,
    deckId: row.deck_id,
    durationSeconds: row.duration_s,
    wordsPerMinute: row.wpm,
    fillers: row.fillers,
    score: row.score,
    transcript: row.transcript,
    createdAt: row.created_at,
  });
}

export class SqliteScenarioAnswerRepository
  implements ScenarioAnswerRepository
{
  constructor(private readonly db: SqlExecutor) {}

  async save(r: ScenarioAnswerRecord): Promise<void> {
    await this.db.execute(
      `INSERT INTO scenario_answers (${COLUMNS}) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        r.promptId,
        r.deckId,
        r.durationSeconds,
        Math.round(r.wordsPerMinute),
        r.fillers,
        r.score === null ? null : Math.round(r.score),
        r.transcript,
        r.createdAt,
      ],
    );
  }

  async listRecent(limit: number): Promise<ScenarioAnswerRecord[]> {
    const rows = await this.db.execute(
      `SELECT ${COLUMNS} FROM scenario_answers ORDER BY id DESC LIMIT ?`,
      [limit],
    );
    return rows.map(toRecord);
  }
}
