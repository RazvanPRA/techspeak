import { z } from 'zod';
import type { SqlExecutor, SqlRow } from '@/services/db';
import { AssessmentDetailsSchema, AttemptRowSchema, WordResultSchema } from '../model/schemas';
import type { AttemptRecord } from '../model/types';
import type { AttemptRepository } from './AttemptRepository';

const COLUMNS =
  'deck_id, sentence_index, score, transcript, words_json, audio_path, created_at, details_json';
const WordsSchema = z.array(WordResultSchema);

function toRecord(row: SqlRow): AttemptRecord {
  const r = AttemptRowSchema.parse(row);
  return {
    deckId: r.deck_id,
    sentenceIndex: r.sentence_index,
    score: r.score,
    transcript: r.transcript,
    words: WordsSchema.parse(JSON.parse(r.words_json)),
    audioPath: r.audio_path,
    createdAt: r.created_at,
    ...(r.details_json ? { details: AssessmentDetailsSchema.parse(JSON.parse(r.details_json)) } : {}),
  };
}

export class SqliteAttemptRepository implements AttemptRepository {
  constructor(private readonly db: SqlExecutor) {}

  async save(record: AttemptRecord): Promise<void> {
    await this.db.execute(`INSERT INTO attempts (${COLUMNS}) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [
      record.deckId,
      record.sentenceIndex,
      record.score,
      record.transcript,
      JSON.stringify(record.words),
      record.audioPath,
      record.createdAt,
      record.details ? JSON.stringify(record.details) : null,
    ]);
  }

  async listByDeck(deckId: string): Promise<AttemptRecord[]> {
    const rows = await this.db.execute(
      `SELECT ${COLUMNS} FROM attempts WHERE deck_id = ? ORDER BY id`,
      [deckId],
    );
    return rows.map(toRecord);
  }

  async listRecent(limit: number): Promise<AttemptRecord[]> {
    const rows = await this.db.execute(
      `SELECT ${COLUMNS} FROM attempts ORDER BY id DESC LIMIT ?`,
      [limit],
    );
    return rows.map(toRecord);
  }
}
