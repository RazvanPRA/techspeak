import { z } from 'zod';

/** One timed scenario answer as stored on the device (feeds the progress trends). */
export const ScenarioAnswerRecordSchema = z.object({
  promptId: z.string(),
  deckId: z.string(),
  durationSeconds: z.number(),
  wordsPerMinute: z.number(),
  fillers: z.number(),
  /** Server score; null when the server could not be reached. */
  score: z.number().nullable(),
  transcript: z.string(),
  createdAt: z.string(),
});

/** One long talk of the talk check (the first one is the baseline). */
export const TalkRecordSchema = z.object({
  audioPath: z.string(),
  durationSeconds: z.number(),
  transcript: z.string(),
  wordsPerMinute: z.number(),
  fillers: z.number(),
  createdAt: z.string(),
});

export type ScenarioAnswerRecord = z.infer<typeof ScenarioAnswerRecordSchema>;
export type TalkRecord = z.infer<typeof TalkRecordSchema>;
