import { INITIAL_EASE } from '../model/constants';
import type { DeckId, ReviewState } from '../model/types';

/** The SM-2 state of a term that has never been reviewed: default ease, due now. */
export function createReviewState(deckId: DeckId, term: string, now: Date): ReviewState {
  return {
    deckId,
    term,
    ease: INITIAL_EASE,
    interval: 0,
    repetitions: 0,
    lapses: 0,
    dueAt: now.toISOString(),
  };
}
