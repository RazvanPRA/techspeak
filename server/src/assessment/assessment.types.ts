export const ERROR_TYPES = [
  'None',
  'Omission',
  'Insertion',
  'Mispronunciation',
  'UnexpectedBreak',
  'MissingBreak',
  'Monotone',
] as const;

export type WordErrorType = (typeof ERROR_TYPES)[number];

export type PhonemeScore = { phoneme: string; accuracy: number };

export type WordScore = {
  word: string;
  accuracy: number;
  errorType: WordErrorType;
  phonemes: PhonemeScore[];
};

export type PronunciationScores = {
  pronunciation: number;
  accuracy: number;
  fluency: number;
  completeness: number;
  /** null when Azure did not return prosody (e.g. a single word). */
  prosody: number | null;
};

/** The result of one pronunciation assessment, independent of the provider. */
export type PronunciationResult = {
  recognized: boolean;
  transcript: string;
  scores: PronunciationScores;
  words: WordScore[];
};
