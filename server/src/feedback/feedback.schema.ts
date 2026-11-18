import { z } from 'zod';

// The answer shape from PROMPTS.md Part B. Any FeedbackProvider (rules today, an LLM later)
// must produce JSON that passes this schema before it leaves the server.

export const CORRECTION_TYPES = [
  'grammar',
  'naturalness',
  'technical',
] as const;

export const CorrectionSchema = z.object({
  said: z.string().min(1),
  better: z.string().min(1),
  type: z.enum(CORRECTION_TYPES),
  why: z.string().min(1),
});

export const PronunciationTipSchema = z.object({
  word: z.string().min(1),
  ipa: z.string(),
  tip: z.string().min(1),
});

export const FluencySchema = z.object({
  wordsPerMinute: z.number().nonnegative(),
  fillerCount: z.number().int().nonnegative(),
  fillers: z.array(z.string()),
  tip: z.string().min(1),
});

export const FeedbackSchema = z.object({
  overallScore: z.number().int().min(0).max(100),
  strength: z.string().min(1),
  corrections: z.array(CorrectionSchema).max(6),
  pronunciation: z.array(PronunciationTipSchema),
  fluency: FluencySchema,
  /** Max 150 words in Part B; ~1200 characters leaves room for long words. */
  improvedAnswer: z.string().max(1200),
  /** Part B asks for exactly three; a deck with fewer sentences may give fewer. */
  phrasesToReuse: z.array(z.string().min(1)).max(3),
});

/** Part B + the deck vocabulary check that the rule-based provider adds. */
export const ScenarioFeedbackSchema = FeedbackSchema.extend({
  vocabulary: z.object({
    used: z.array(z.string()),
    missing: z.array(z.string()),
  }),
});

export type Feedback = z.infer<typeof FeedbackSchema>;
export type ScenarioFeedback = z.infer<typeof ScenarioFeedbackSchema>;
