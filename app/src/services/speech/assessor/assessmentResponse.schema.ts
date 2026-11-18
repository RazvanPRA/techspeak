import { z } from 'zod';

// Reply of the server's POST /assessment (server/src/assessment/dto/assessment-response.dto.ts).

const PhonemeSchema = z.object({ phoneme: z.string(), accuracy: z.number() });

export const ServerWordSchema = z.object({
  word: z.string(),
  accuracy: z.number(),
  /** None | Omission | Insertion | Mispronunciation | UnexpectedBreak | MissingBreak | Monotone */
  errorType: z.string(),
  phonemes: z.array(PhonemeSchema),
});

export const AssessmentResponseSchema = z.object({
  recognized: z.boolean(),
  transcript: z.string(),
  scores: z.object({
    pronunciation: z.number(),
    accuracy: z.number(),
    fluency: z.number(),
    completeness: z.number(),
    prosody: z.number().nullable(),
  }),
  words: z.array(ServerWordSchema),
});

export type ServerWord = z.infer<typeof ServerWordSchema>;
export type AssessmentResponse = z.infer<typeof AssessmentResponseSchema>;
