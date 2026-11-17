import {
  type AnswerMetrics,
  fillerRate,
  MIN_ANSWER_WORDS,
  PACE_BAND,
} from './answer-metrics.js';

// Points per part; they add up to 100.
const LENGTH = 30; // full at ~1 minute of speech
const PACE = 20;
const FILLERS = 20;
const VOCABULARY = 20; // full at 4 deck terms
const STRUCTURE = 10;

const FULL_LENGTH_WORDS = 120;
const FULL_VOCABULARY_TERMS = 4;
const PACE_FALLOFF_WPM = 60; // zero pace points this far outside the band
const ZERO_FILLER_RATE = 0.1; // one filler in ten words
const LONG_SENTENCE_PENALTY = 4;
const PRONUNCIATION_WEIGHT = 0.2;

const ratio = (value: number, full: number) =>
  Math.min(Math.max(value / full, 0), 1);

function pacePoints(wpm: number): number {
  const distance = Math.max(PACE_BAND.min - wpm, wpm - PACE_BAND.max, 0);
  return PACE * (1 - ratio(distance, PACE_FALLOFF_WPM));
}

/** 0–100 from length, pace, fillers, deck vocabulary and sentence length (+ pronunciation). */
export function scoreAnswer(m: AnswerMetrics): number {
  if (m.wordCount < MIN_ANSWER_WORDS) return 0;
  const base =
    LENGTH * ratio(m.wordCount, FULL_LENGTH_WORDS) +
    pacePoints(m.wordsPerMinute) +
    FILLERS * (1 - ratio(fillerRate(m), ZERO_FILLER_RATE)) +
    VOCABULARY * ratio(m.termsUsed.length, FULL_VOCABULARY_TERMS) +
    Math.max(0, STRUCTURE - LONG_SENTENCE_PENALTY * m.longSentenceCount);
  const blended =
    m.pronunciationAverage === null
      ? base
      : (1 - PRONUNCIATION_WEIGHT) * base +
        PRONUNCIATION_WEIGHT * m.pronunciationAverage;
  return Math.round(Math.min(Math.max(blended, 0), 100));
}
