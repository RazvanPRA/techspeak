import type { DeckId, ReviewState } from '../model/types';

/** SM-2 review state per term. The terms themselves come from the DeckRepository. */
export interface VocabularyRepository {
  /** Stored states for the given decks, or for every deck when `deckIds` is omitted. */
  listStates(deckIds?: readonly DeckId[]): Promise<ReviewState[]>;
  /** Inserts or replaces the state of one term. */
  saveReview(state: ReviewState): Promise<void>;
}
