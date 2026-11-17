import type { DeckId } from './types';

/** Unique key of a term's review state (the same term can appear in several decks). */
export const reviewKey = (deckId: DeckId, term: string): string => `${deckId}::${term}`;
