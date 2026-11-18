import type { SyncBatch, VocabularyStateSync } from '../model/types';

type Pair = SyncBatch['pairAttempts'][number];
type Talk = SyncBatch['talks'][number];

export const pair = (id: string): Pair => ({
  id,
  pairId: 'ship-sheep',
  sound: 'ɪ-iː',
  mode: 'listen',
  correct: true,
  createdAt: '2026-11-18T09:00:00.000Z',
});

export const talk = (id: string): Talk => ({
  id,
  durationSeconds: 180,
  transcript: 'Today I will talk about indexes',
  wordsPerMinute: 130,
  fillers: 3,
  createdAt: '2026-11-18T09:00:00.000Z',
});

/** A state of sql/<term>, last changed at 2026-11-18T<time>:00.000Z. */
export const vocab = (time: string, term = 'query', interval = 1): VocabularyStateSync => ({
  id: `sql:${term}`,
  deckId: 'sql',
  term,
  ease: 2.5,
  interval,
  repetitions: 1,
  dueAt: '2026-11-19T09:00:00.000Z',
  lapses: 0,
  updatedAt: `2026-11-18T${time}:00.000Z`,
});
