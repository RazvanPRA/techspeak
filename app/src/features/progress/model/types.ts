// Inputs are plain shapes mapped in src/app/dependencies.ts from the other features' public
// repositories, so progress never depends on how they store their data.

export type ScoredAttempt = { createdAt: string; deckId: string; score: number };
export type PairResult = { sound: string; correct: boolean };
export type PhonemeResult = { phoneme: string; accuracy: number };
export type ReviewInterval = { interval: number };
export type FluencySample = {
  createdAt: string;
  wordsPerMinute: number;
  fillers: number;
  durationSeconds: number;
};

export type DayValue = { day: string; value: number; count: number };
export type DeckValue = { deckId: string; value: number; count: number };
export type WeakSound = { sound: string; errorRate: number; samples: number };
export type FluencyPoint = { day: string; wordsPerMinute: number; fillersPerMinute: number };

/** Everything the Progress tab shows. */
export type ProgressData = {
  scoreByDay: DayValue[];
  scoreByDeck: DeckValue[];
  masteredWords: number;
  weakSounds: WeakSound[];
  fluency: FluencyPoint[];
};
