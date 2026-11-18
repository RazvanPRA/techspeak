import type { AnswerMetrics } from '../rules/answer-metrics.js';

/** A solid answer: 90 s, 135 wpm, few fillers, four deck terms. */
export const goodMetrics = (
  overrides: Partial<AnswerMetrics> = {},
): AnswerMetrics => ({
  wordCount: 200,
  durationSeconds: 90,
  wordsPerMinute: 133,
  fillerCount: 2,
  fillers: ['um'],
  longSentenceCount: 0,
  termsUsed: ['query', 'index', 'transaction', 'isolation level'],
  pronunciationAverage: null,
  ...overrides,
});
