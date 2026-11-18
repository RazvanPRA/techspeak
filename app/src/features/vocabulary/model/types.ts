import type { z } from 'zod';
import type { DeckSchema, ReviewStateSchema, TermSchema } from './schemas';

export type Term = z.infer<typeof TermSchema>;
export type Deck = z.infer<typeof DeckSchema>;
export type DeckId = Deck['id'];
export type DeckSummary = Pick<Deck, 'id' | 'title'> & { sentenceCount: number; termCount: number };

/** SM-2 state of one term, stored in SQLite. `dueAt` is an ISO timestamp. */
export type ReviewState = z.infer<typeof ReviewStateSchema>;

/** SM-2 quality of recall: 0–2 failed, 3 hard, 4 good, 5 easy. */
export type Grade = 0 | 1 | 2 | 3 | 4 | 5;

/** A term together with the deck it belongs to (the same word can appear in several decks). */
export type DeckTerm = { deckId: DeckId; term: Term };

/** A term to review. `state` is null for a term that has never been reviewed. */
export type ReviewCard = DeckTerm & { state: ReviewState | null };

/** What the review queue is built from: chosen decks, or the "weak words" smart deck. */
export type ReviewSelection = { kind: 'decks'; deckIds: DeckId[] } | { kind: 'weak' };

/** Result of saying the term aloud. A recognised term carries the grade it earns. */
export type SayItOutcome =
  | { kind: 'idle' }
  | { kind: 'recognised'; transcript: string; grade: Grade }
  | { kind: 'missed'; transcript: string };
