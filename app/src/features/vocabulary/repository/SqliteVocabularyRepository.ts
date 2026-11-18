import { z } from 'zod';
import type { SqlExecutor, SqlRow } from '@/services/db';
import { ReviewStateSchema } from '../model/schemas';
import type { DeckId, ReviewState } from '../model/types';
import type { VocabularyRepository } from './VocabularyRepository';

const COLUMNS = 'deck_id, term, ease, interval, repetitions, due_at, lapses';

const RowSchema = z.object({
  deck_id: z.string(),
  term: z.string(),
  ease: z.number(),
  interval: z.number(),
  repetitions: z.number(),
  due_at: z.string(),
  lapses: z.number(),
});

function toState(row: SqlRow): ReviewState {
  const r = RowSchema.parse(row);
  return ReviewStateSchema.parse({
    deckId: r.deck_id,
    term: r.term,
    ease: r.ease,
    interval: r.interval,
    repetitions: r.repetitions,
    dueAt: r.due_at,
    lapses: r.lapses,
  });
}

export class SqliteVocabularyRepository implements VocabularyRepository {
  constructor(private readonly db: SqlExecutor) {}

  async listStates(deckIds?: readonly DeckId[]): Promise<ReviewState[]> {
    if (deckIds?.length === 0) return [];
    const where = deckIds ? `WHERE deck_id IN (${deckIds.map(() => '?').join(', ')})` : '';
    const rows = await this.db.execute(`SELECT ${COLUMNS} FROM review_state ${where}`, deckIds);
    return rows.map(toState);
  }

  async saveReview(state: ReviewState): Promise<void> {
    await this.db.execute(`INSERT OR REPLACE INTO review_state (${COLUMNS}) VALUES (?, ?, ?, ?, ?, ?, ?)`, [
      state.deckId,
      state.term,
      state.ease,
      state.interval,
      state.repetitions,
      state.dueAt,
      state.lapses,
    ]);
  }
}
