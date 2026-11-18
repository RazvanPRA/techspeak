import type {
  PairAttemptRecord,
  ShadowingAttemptRecord,
  SyncBatch,
  VocabularyStateRecord,
} from '../sync.types.js';

export const emptyBatch = (): SyncBatch => ({
  shadowingAttempts: [],
  pairAttempts: [],
  vocabularyStates: [],
  scenarioAnswers: [],
  talks: [],
});

export const shadowingAttempt = (id: string): ShadowingAttemptRecord => ({
  id,
  deckId: 'sql',
  sentenceIndex: 0,
  score: 80,
  transcript: 'select star from users',
  words: [{ kind: 'match', word: 'select' }],
  details: null,
  createdAt: '2026-11-18T09:00:00.000Z',
});

export const pairAttempt = (id: string): PairAttemptRecord => ({
  id,
  pairId: 'ship-sheep',
  sound: 'ɪ-iː',
  mode: 'listen',
  correct: true,
  createdAt: '2026-11-18T09:01:00.000Z',
});

export const vocabularyState = (
  updatedAt: string,
  changes: Partial<VocabularyStateRecord> = {},
): VocabularyStateRecord => ({
  id: 'sql:query',
  deckId: 'sql',
  term: 'query',
  ease: 2.5,
  interval: 1,
  repetitions: 1,
  dueAt: '2026-11-19T09:00:00.000Z',
  lapses: 0,
  updatedAt,
  ...changes,
});

/** A batch with one row of every kind. */
export const fullBatch = (): SyncBatch => ({
  shadowingAttempts: [shadowingAttempt('s-1')],
  pairAttempts: [pairAttempt('p-1')],
  vocabularyStates: [vocabularyState('2026-11-18T09:02:00.000Z')],
  scenarioAnswers: [
    {
      id: 'a-1',
      promptId: 'sql-1',
      deckId: 'sql',
      durationSeconds: 42.5,
      wordsPerMinute: 120,
      fillers: 2,
      score: null,
      transcript: 'I would add an index',
      createdAt: '2026-11-18T09:03:00.000Z',
    },
  ],
  talks: [
    {
      id: 't-1',
      durationSeconds: 180,
      transcript: 'Today I will talk about indexes',
      wordsPerMinute: 130,
      fillers: 5,
      createdAt: '2026-11-18T09:04:00.000Z',
    },
  ],
});
