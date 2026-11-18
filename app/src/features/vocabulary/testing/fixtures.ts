import type { DeckTerm, ReviewState, Term } from '../model/types';

export const makeTerm = (term: string, extra: Partial<Term> = {}): Term => ({
  term,
  ipa: null,
  spelled: false,
  hint: null,
  meaning: null,
  example: null,
  ...extra,
});

export const deckTerm = (deckId: string, term: string): DeckTerm => ({
  deckId,
  term: makeTerm(term),
});

export const makeState = (
  deckId: string,
  term: string,
  extra: Partial<ReviewState> = {},
): ReviewState => ({
  deckId,
  term,
  ease: 2.5,
  interval: 1,
  repetitions: 1,
  lapses: 0,
  dueAt: '2026-11-17T08:00:00.000Z',
  ...extra,
});
