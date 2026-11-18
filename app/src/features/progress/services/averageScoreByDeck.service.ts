import type { DeckValue, ScoredAttempt } from '../model/types';
import { average, groupBy } from './groupBy.service';

/** Average shadowing score per deck, weakest deck first. */
export function averageScoreByDeck(attempts: readonly ScoredAttempt[]): DeckValue[] {
  return [...groupBy(attempts, a => a.deckId).entries()]
    .map(([deckId, group]) => ({
      deckId,
      value: Math.round(average(group.map(a => a.score))),
      count: group.length,
    }))
    .sort((a, b) => a.value - b.value || a.deckId.localeCompare(b.deckId));
}
