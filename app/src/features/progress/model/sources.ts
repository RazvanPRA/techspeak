import type {
  FluencySample,
  PairResult,
  PhonemeResult,
  ReviewInterval,
  ScoredAttempt,
} from './types';

/** A shadowing attempt with its Azure phoneme scores (empty when scored on the device). */
export type ShadowingSample = ScoredAttempt & { phonemes: PhonemeResult[] };

/**
 * Where the progress data comes from. Mapped in src/app/dependencies.ts from the public
 * repositories of shadowing, minimal-pairs, vocabulary and scenarios.
 */
export type ProgressSources = {
  shadowingAttempts: (limit: number) => Promise<ShadowingSample[]>;
  pairResults: (limit: number) => Promise<PairResult[]>;
  reviewIntervals: () => Promise<ReviewInterval[]>;
  scenarioAnswers: (limit: number) => Promise<FluencySample[]>;
};
