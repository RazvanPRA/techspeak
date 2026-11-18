import type { Term } from '@/features/vocabulary';
import type { WordResult } from '@/services/scoring';
import type { AssessmentDetails } from '@/services/speech';

/** One display word of a sentence. `normalized` is what the diff compares. */
export type SentenceToken = {
  text: string;
  normalized: string;
  term: Term | null;
};

export type TokenStatus = 'pending' | 'ok' | 'wrong' | 'missing';

export type AttemptResult = {
  score: number;
  transcript: string;
  words: WordResult[];
  audioPath: string;
  /** Phoneme-level scores when Azure assessed the attempt (not persisted). */
  details?: AssessmentDetails;
};

export type AttemptRecord = AttemptResult & {
  deckId: string;
  sentenceIndex: number;
  createdAt: string;
};

