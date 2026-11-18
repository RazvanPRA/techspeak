import { z } from 'zod';

// The /sync wire format (mirrors server/src/sync/sync.types.ts). Dates are ISO strings.

const id = z.string().min(1);

export const ShadowingAttemptSyncSchema = z.object({
  id,
  deckId: z.string(),
  sentenceIndex: z.number().int(),
  score: z.number().int(),
  transcript: z.string(),
  words: z.array(z.unknown()),
  details: z.record(z.string(), z.unknown()).nullable(),
  createdAt: z.string(),
});

export const PairAttemptSyncSchema = z.object({
  id,
  pairId: z.string(),
  sound: z.string(),
  mode: z.enum(['listen', 'say']),
  correct: z.boolean(),
  createdAt: z.string(),
});

export const VocabularyStateSyncSchema = z.object({
  /** "<deckId>:<term>" */
  id,
  deckId: z.string(),
  term: z.string(),
  ease: z.number(),
  interval: z.number().int(),
  repetitions: z.number().int(),
  dueAt: z.string(),
  lapses: z.number().int(),
  updatedAt: z.string(),
});

export const ScenarioAnswerSyncSchema = z.object({
  id,
  promptId: z.string(),
  deckId: z.string(),
  durationSeconds: z.number(),
  wordsPerMinute: z.number().int(),
  fillers: z.number().int(),
  score: z.number().int().nullable(),
  transcript: z.string(),
  createdAt: z.string(),
});

export const TalkSyncSchema = z.object({
  id,
  durationSeconds: z.number(),
  transcript: z.string(),
  wordsPerMinute: z.number().int(),
  fillers: z.number().int(),
  createdAt: z.string(),
});

export const SyncBatchSchema = z.object({
  shadowingAttempts: z.array(ShadowingAttemptSyncSchema),
  pairAttempts: z.array(PairAttemptSyncSchema),
  vocabularyStates: z.array(VocabularyStateSyncSchema),
  scenarioAnswers: z.array(ScenarioAnswerSyncSchema),
  talks: z.array(TalkSyncSchema),
});

export const SyncChangesSchema = z.object({
  changes: SyncBatchSchema,
  cursor: z.string(),
  hasMore: z.boolean(),
});

export const SyncUploadResultSchema = z.object({ received: z.number() });
