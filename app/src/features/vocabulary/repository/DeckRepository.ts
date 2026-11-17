import type { Deck, DeckId, DeckSummary } from '../model/types';

export interface DeckRepository {
  listDecks(): DeckSummary[];
  getDeck(id: DeckId): Deck | undefined;
}
