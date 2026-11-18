import type { DeckRepository } from '../repository/DeckRepository';
import type { VocabularyRepository } from '../repository/VocabularyRepository';
import { loadReviewQueue } from './loadReviewQueue.service';

/** How many cards (due + new, within the session limits) a review of every deck would show. */
export async function countReviewCards(
  sources: { decks: DeckRepository; reviews: VocabularyRepository },
  now: Date,
): Promise<number> {
  const deckIds = sources.decks.listDecks().map(d => d.id);
  const queue = await loadReviewQueue(
    { ...sources, missedWords: async () => new Map() },
    { kind: 'decks', deckIds },
    now,
  );
  return queue.length;
}
