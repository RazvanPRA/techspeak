import {
  type AnswerMetrics,
  fillerRate,
  isInPaceBand,
  MIN_ANSWER_WORDS,
  TARGET_SECONDS,
} from './answer-metrics.js';

const MANY_TERMS = 4;
const FEW_FILLERS_RATE = 0.02;

type Rule = {
  applies: (m: AnswerMetrics) => boolean;
  text: (m: AnswerMetrics, deck: string) => string;
};

/** In priority order: the first that applies is the one real strength we praise. */
const RULES: readonly Rule[] = [
  {
    applies: (m) => m.termsUsed.length >= MANY_TERMS,
    text: (m, deck) =>
      `You used ${m.termsUsed.length} key ${deck} terms, which makes the answer sound precise.`,
  },
  {
    applies: (m) => isInPaceBand(m.wordsPerMinute),
    text: (m) =>
      `Your pace of ${m.wordsPerMinute} words per minute is easy to follow.`,
  },
  {
    applies: (m) => fillerRate(m) < FEW_FILLERS_RATE,
    text: () => 'You spoke with almost no filler words.',
  },
  {
    applies: (m) => m.durationSeconds >= TARGET_SECONDS,
    text: () =>
      'You kept talking for over a minute, which is the length interviewers expect.',
  },
  {
    applies: (m) => m.termsUsed.length > 0,
    text: (m) => `You brought in deck vocabulary such as "${m.termsUsed[0]}".`,
  },
];

const NO_ANSWER =
  'I heard almost nothing. Next time, start with a one-sentence definition, then give one real example.';
const FALLBACK =
  'You finished an answer out loud, which is the hardest part. Keep going.';

/** One sentence of honest praise (Part B: "Praise one real strength"). */
export function pickStrength(m: AnswerMetrics, deckTitle: string): string {
  if (m.wordCount < MIN_ANSWER_WORDS) return NO_ANSWER;
  return RULES.find((r) => r.applies(m))?.text(m, deckTitle) ?? FALLBACK;
}
