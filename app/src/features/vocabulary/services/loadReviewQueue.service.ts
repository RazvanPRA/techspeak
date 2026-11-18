import {
  MAX_CARDS_PER_SESSION,
  MAX_NEW_CARDS_PER_SESSION,
  WEAK_WORDS_LIMIT,
} from '../model/constants';
import type { DeckId, DeckTerm, ReviewCard, ReviewSelection } from '../model/types';
import type { DeckRepository } from '../repository/DeckRepository';
import type { VocabularyRepository } from '../repository/VocabularyRepository';
import { buildReviewQueue } from './buildReviewQueue.service';
import { rankWeakWords } from './rankWeakWords.service';

type QueueSources = {
  decks: DeckRepository;
  reviews: VocabularyRepository;
  missedWords: () => Promise<ReadonlyMap<string, number>>;
};

function collectTerms(decks: DeckRepository, deckIds: readonly DeckId[]): DeckTerm[] {
  return deckIds.flatMap(deckId => decks.getDeck(deckId)?.terms.map(term => ({ deckId, term })) ?? []);
}

/** Loads the cards for one review session: due + new cards of the chosen decks, or weak words. */
export async function loadReviewQueue(
  sources: QueueSources,
  selection: ReviewSelection,
  now: Date,
): Promise<ReviewCard[]> {
  if (selection.kind === 'decks') {
    const terms = collectTerms(sources.decks, selection.deckIds);
    const states = await sources.reviews.listStates(selection.deckIds);
    const limits = { maxCards: MAX_CARDS_PER_SESSION, maxNewCards: MAX_NEW_CARDS_PER_SESSION };
    return buildReviewQueue(terms, states, { now, limits });
  }
  const allIds = sources.decks.listDecks().map(d => d.id);
  const [states, missedWords] = await Promise.all([
    sources.reviews.listStates(),
    sources.missedWords(),
  ]);
  const terms = collectTerms(sources.decks, allIds);
  return rankWeakWords({ terms, states, missedWords, limit: WEAK_WORDS_LIMIT });
}
