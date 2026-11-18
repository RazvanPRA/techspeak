/** Measured facts about one spoken answer; the inputs of score, strength and tips. */
export type AnswerMetrics = {
  wordCount: number;
  durationSeconds: number;
  wordsPerMinute: number;
  fillerCount: number;
  fillers: string[];
  longSentenceCount: number;
  termsUsed: string[];
  /** Mean Azure word accuracy, or null when no pronunciation scores were sent. */
  pronunciationAverage: number | null;
};

/** Fewer words than this counts as "no real answer" (score 0). */
export const MIN_ANSWER_WORDS = 15;
export const TARGET_SECONDS = 60;
export const PACE_BAND = { min: 110, max: 170 } as const;

export const fillerRate = (m: AnswerMetrics): number =>
  m.wordCount === 0 ? 0 : m.fillerCount / m.wordCount;

export const isInPaceBand = (wpm: number): boolean =>
  wpm >= PACE_BAND.min && wpm <= PACE_BAND.max;
