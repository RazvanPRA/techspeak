import { z } from 'zod';

/** Mirrors `WordResult` from services/scoring, for data read back from storage. */
export const WordResultSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('ok'), targetIndex: z.number(), word: z.string() }),
  z.object({
    kind: z.literal('wrong'),
    targetIndex: z.number(),
    word: z.string(),
    spoken: z.string(),
  }),
  z.object({ kind: z.literal('missing'), targetIndex: z.number(), word: z.string() }),
  z.object({ kind: z.literal('extra'), spoken: z.string() }),
]);

export const AttemptRowSchema = z.object({
  deck_id: z.string(),
  sentence_index: z.number(),
  score: z.number(),
  transcript: z.string(),
  words_json: z.string(),
  audio_path: z.string(),
  created_at: z.string(),
});
