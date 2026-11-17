import type { z } from 'zod';
import type { MinimalPairSchema, PairAttemptSchema, PairModeSchema, SOUNDS } from './schemas';

export type MinimalPair = z.infer<typeof MinimalPairSchema>;
export type PairWord = MinimalPair['a'];
export type Sound = (typeof SOUNDS)[number];
export type PairSide = 'a' | 'b';
export type PairMode = z.infer<typeof PairModeSchema>;
export type PairAttempt = z.infer<typeof PairAttemptSchema>;

/** One drill: the pair, which side is the target, and the word it can be confused with. */
export type Round = {
  pair: MinimalPair;
  side: PairSide;
  target: PairWord;
  other: PairWord;
};

/**
 * Say-it result: the target was heard, the other word was heard, neither clearly, or (with
 * phoneme scoring) the target was recognised but pronounced below the pass accuracy.
 */
export type SayVerdict = 'correct' | 'confused' | 'unclear' | 'weak';

export type SayResult = {
  verdict: SayVerdict;
  transcript: string;
  /** Azure's accuracy for the target word, when available. */
  accuracy: number | null;
};
