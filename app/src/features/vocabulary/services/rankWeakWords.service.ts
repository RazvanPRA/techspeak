import { normalizeTranscript } from '@/services/scoring';
import { INITIAL_EASE } from '../model/constants';
import { reviewKey } from '../model/reviewKey';
import type { DeckTerm, ReviewCard, ReviewState } from '../model/types';

type WeakInput = {
  terms: readonly DeckTerm[];
  states: readonly ReviewState[];
  /** Normalized word → how often it was wrong or missing in shadowing. */
  missedWords: ReadonlyMap<string, number>;
  limit: number;
};

/** A multi-word term counts as missed only as often as its least-missed word. */
function missedCount(term: string, missedWords: ReadonlyMap<string, number>): number {
  const words = normalizeTranscript(term);
  if (words.length === 0) return 0;
  return Math.min(...words.map(w => missedWords.get(w) ?? 0));
}

function weakness(state: ReviewState | null, missed: number): number {
  const reviewPart = state ? state.lapses + (INITIAL_EASE - state.ease) : 0;
  return reviewPart + missed;
}

/** The "weak words" smart deck: most lapses, lowest ease and most shadowing misses first. */
export function rankWeakWords({ terms, states, missedWords, limit }: WeakInput): ReviewCard[] {
  const byKey = new Map(states.map(s => [reviewKey(s.deckId, s.term), s]));
  return terms
    .map(entry => {
      const state = byKey.get(reviewKey(entry.deckId, entry.term.term)) ?? null;
      const score = weakness(state, missedCount(entry.term.term, missedWords));
      return { card: { ...entry, state }, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ card }) => card);
}
