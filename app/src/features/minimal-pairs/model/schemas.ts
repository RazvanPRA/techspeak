import { z } from 'zod';

/** Sound contrasts drilled for Romanian speakers (SPEC 3.3). */
export const SOUNDS = ['θ-s', 'θ-t', 'ð-d', 'w-v', 'ɪ-iː', 'ʊ-uː', 'æ-e', 't-ɪd'] as const;

const PairWordSchema = z.object({
  word: z.string().regex(/^[a-z]+$/),
  ipa: z.string().regex(/^\/.+\/$/),
});

export const MinimalPairSchema = z.object({
  id: z.string().min(1),
  sound: z.enum(SOUNDS),
  a: PairWordSchema,
  b: PairWordSchema,
  tip: z.string().min(1).nullable(),
});

export const MinimalPairsSeedSchema = z.array(MinimalPairSchema).min(1);

export const PairModeSchema = z.enum(['listen', 'say']);

export const PairAttemptSchema = z.object({
  pairId: z.string().min(1),
  sound: z.enum(SOUNDS),
  mode: PairModeSchema,
  correct: z.boolean(),
  createdAt: z.string().min(1),
});
