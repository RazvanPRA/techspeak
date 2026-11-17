import { z } from 'zod';

export const TermSchema = z.object({
  term: z.string().min(1),
  ipa: z.string().min(1).nullable(),
  spelled: z.boolean(),
  hint: z.string().min(1).nullable(),
  meaning: z.string().min(1).nullable(),
  example: z.string().min(1).nullable(),
});

export const DeckSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  terms: z.array(TermSchema).min(1),
  sentences: z.array(z.string().min(1)).min(1),
});
