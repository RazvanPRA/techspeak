import { z } from 'zod';

/** One topic of src/content/prompts.json (generated from VOCABULARY.md "Speaking prompts"). */
export const PromptGroupSeedSchema = z.object({
  topic: z.string().min(1),
  deckId: z.string().regex(/^[a-z0-9-]+$/),
  prompts: z.array(z.string().min(1)).min(1),
});

// Mirrors the server's ScenarioFeedbackSchema (server/src/feedback/feedback.schema.ts).
export const ScenarioFeedbackSchema = z.object({
  overallScore: z.number().min(0).max(100),
  strength: z.string(),
  corrections: z.array(
    z.object({
      said: z.string(),
      better: z.string(),
      type: z.enum(['grammar', 'naturalness', 'technical']),
      why: z.string(),
    }),
  ),
  pronunciation: z.array(z.object({ word: z.string(), ipa: z.string(), tip: z.string() })),
  fluency: z.object({
    wordsPerMinute: z.number(),
    fillerCount: z.number(),
    fillers: z.array(z.string()),
    tip: z.string(),
  }),
  improvedAnswer: z.string(),
  phrasesToReuse: z.array(z.string()),
  vocabulary: z.object({ used: z.array(z.string()), missing: z.array(z.string()) }),
});
