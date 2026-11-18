// The sync wire format, shared by POST /sync, GET /sync and the stores. Dates are ISO strings.
// `id` is created by the app; word scores and Azure details are the app's JSON, kept as is.

export type ShadowingAttemptRecord = {
  id: string;
  deckId: string;
  sentenceIndex: number;
  score: number;
  transcript: string;
  words: unknown[];
  details: Record<string, unknown> | null;
  createdAt: string;
};

export type PairAttemptRecord = {
  id: string;
  pairId: string;
  sound: string;
  mode: 'listen' | 'say';
  correct: boolean;
  createdAt: string;
};

export type VocabularyStateRecord = {
  /** "<deckId>:<term>" */
  id: string;
  deckId: string;
  term: string;
  ease: number;
  interval: number;
  repetitions: number;
  dueAt: string;
  lapses: number;
  updatedAt: string;
};

export type ScenarioAnswerRecord = {
  id: string;
  promptId: string;
  deckId: string;
  durationSeconds: number;
  wordsPerMinute: number;
  fillers: number;
  score: number | null;
  transcript: string;
  createdAt: string;
};

export type TalkRecord = {
  id: string;
  durationSeconds: number;
  transcript: string;
  wordsPerMinute: number;
  fillers: number;
  createdAt: string;
};

export type SyncBatch = {
  shadowingAttempts: ShadowingAttemptRecord[];
  pairAttempts: PairAttemptRecord[];
  vocabularyStates: VocabularyStateRecord[];
  scenarioAnswers: ScenarioAnswerRecord[];
  talks: TalkRecord[];
};

export type SyncKind = keyof SyncBatch;

export const SYNC_KINDS = [
  'shadowingAttempts',
  'pairAttempts',
  'vocabularyStates',
  'scenarioAnswers',
  'talks',
] as const satisfies readonly SyncKind[];

/** The highest `seq` already downloaded, per table. */
export type SyncCursor = Record<SyncKind, number>;

/** Rows newer than a cursor, each with its `seq`. */
export type StoredChanges = {
  [K in SyncKind]: Array<SyncBatch[K][number] & { seq: number }>;
};

/** Max rows per table in one upload and in one download page. */
export const SYNC_PAGE_SIZE = 200;
