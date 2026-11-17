import { reviewKey } from '../model/reviewKey';
import type { DeckTerm, ReviewCard, ReviewState } from '../model/types';

export type QueueLimits = { maxCards: number; maxNewCards: number };

/**
 * Due cards first (most overdue first), then never-reviewed terms in deck order,
 * capped by the session limits. Cards that are not due yet are left out.
 */
export function buildReviewQueue(
  terms: readonly DeckTerm[],
  states: readonly ReviewState[],
  options: { now: Date; limits: QueueLimits },
): ReviewCard[] {
  const byKey = new Map(states.map(s => [reviewKey(s.deckId, s.term), s]));
  const now = options.now.toISOString();
  const due: ReviewCard[] = [];
  const fresh: ReviewCard[] = [];
  for (const entry of terms) {
    const state = byKey.get(reviewKey(entry.deckId, entry.term.term)) ?? null;
    if (state === null) fresh.push({ ...entry, state });
    else if (state.dueAt <= now) due.push({ ...entry, state });
  }
  due.sort((a, b) => (a.state?.dueAt ?? '').localeCompare(b.state?.dueAt ?? ''));
  const { maxCards, maxNewCards } = options.limits;
  return [...due, ...fresh.slice(0, maxNewCards)].slice(0, maxCards);
}
