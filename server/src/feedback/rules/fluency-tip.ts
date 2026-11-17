import {
  type AnswerMetrics,
  fillerRate,
  MIN_ANSWER_WORDS,
  PACE_BAND,
  TARGET_SECONDS,
} from './answer-metrics.js';

const MANY_FILLERS_RATE = 0.05;

type Rule = {
  applies: (m: AnswerMetrics) => boolean;
  text: (m: AnswerMetrics) => string;
};

/** In priority order: the first that applies is the most useful fix. */
const RULES: readonly Rule[] = [
  {
    applies: (m) => m.wordCount < MIN_ANSWER_WORDS,
    text: () =>
      'Aim for 60–120 seconds: a definition, how it works, a real example, a trade-off.',
  },
  {
    applies: (m) => fillerRate(m) >= MANY_FILLERS_RATE,
    text: (m) =>
      `Replace "${m.fillers[0] ?? 'um'}" with a short silent pause; pauses sound confident, fillers do not.`,
  },
  {
    applies: (m) => m.wordsPerMinute > PACE_BAND.max,
    text: () =>
      'Slow down a little: pause after each key idea so the listener can keep up.',
  },
  {
    applies: (m) => m.wordsPerMinute < PACE_BAND.min,
    text: () =>
      'Try to keep moving: prepare your first sentence, then link ideas with "because", "which means" and "for example".',
  },
  {
    applies: (m) => m.longSentenceCount > 0,
    text: () =>
      'Break long sentences in two: one idea per sentence is easier to follow when spoken.',
  },
  {
    applies: (m) => m.durationSeconds < TARGET_SECONDS,
    text: () =>
      'Push the answer past one minute: add a concrete example or a trade-off.',
  },
];

const ALL_GOOD =
  'Good flow. Next time, add one trade-off or a real-world example.';

/** The single most useful fluency tip for this answer. */
export function fluencyTip(m: AnswerMetrics): string {
  return RULES.find((r) => r.applies(m))?.text(m) ?? ALL_GOOD;
}
