import {
  FILLERS_PER_MINUTE_LIMIT,
  MIN_ANSWER_SECONDS,
  PACE_RANGE,
} from '../model/constants';
import type { AnswerResult, InterviewIssue } from '../model/types';

const TOP_ITEMS = 3;
const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

/** Server fluency when there is feedback, the on-device summary otherwise. */
const fluencyOf = (a: AnswerResult) => a.feedback?.fluency ?? a.localFluency;

/** Items sorted by how many answers they appear in, with that count. */
function rankByAnswers(lists: readonly string[][]): {
  items: string[];
  top: number;
} {
  const counts = new Map<string, number>();
  lists.forEach(list =>
    new Set(list).forEach(x => counts.set(x, (counts.get(x) ?? 0) + 1)),
  );
  const ranked = [...counts.entries()].sort(
    (a, b) => b[1] - a[1] || a[0].localeCompare(b[0]),
  );
  return {
    items: ranked.slice(0, TOP_ITEMS).map(([x]) => x),
    top: ranked[0]?.[1] ?? 0,
  };
}

export function lengthIssue(
  answers: readonly AnswerResult[],
): InterviewIssue | null {
  const short = answers.filter(
    a => a.durationSeconds < MIN_ANSWER_SECONDS,
  ).length;
  if (short === 0) return null;
  return {
    kind: 'length',
    severity: short / answers.length,
    shortAnswers: short,
    total: answers.length,
  };
}

export function fillerIssue(
  answers: readonly AnswerResult[],
): InterviewIssue | null {
  const minutes = answers.reduce((s, a) => s + a.durationSeconds, 0) / 60;
  const count = answers.reduce((s, a) => s + fluencyOf(a).fillerCount, 0);
  const perMinute = minutes > 0 ? count / minutes : 0;
  if (perMinute <= FILLERS_PER_MINUTE_LIMIT) return null;
  const { items } = rankByAnswers(answers.map(a => fluencyOf(a).fillers));
  return {
    kind: 'fillers',
    severity: clamp01(perMinute / 4),
    perMinute: Math.round(perMinute * 10) / 10,
    fillers: items,
  };
}

export function paceIssue(
  answers: readonly AnswerResult[],
): InterviewIssue | null {
  const total = answers.reduce((s, a) => s + fluencyOf(a).wordsPerMinute, 0);
  const wordsPerMinute = Math.round(total / answers.length);
  const tooFast = wordsPerMinute > PACE_RANGE.max;
  if (!tooFast && wordsPerMinute >= PACE_RANGE.min) return null;
  const distance = tooFast
    ? wordsPerMinute - PACE_RANGE.max
    : PACE_RANGE.min - wordsPerMinute;
  return {
    kind: 'pace',
    severity: clamp01(distance / 30),
    wordsPerMinute,
    tooFast,
  };
}

export function pronunciationIssue(
  answers: readonly AnswerResult[],
): InterviewIssue | null {
  const { items, top } = rankByAnswers(
    answers.map(a => a.feedback?.pronunciation.map(p => p.word) ?? []),
  );
  return top === 0
    ? null
    : { kind: 'pronunciation', severity: top / answers.length, words: items };
}

export function vocabularyIssue(
  answers: readonly AnswerResult[],
): InterviewIssue | null {
  const { items, top } = rankByAnswers(
    answers.map(a => a.feedback?.vocabulary.missing ?? []),
  );
  return top === 0
    ? null
    : { kind: 'vocabulary', severity: top / answers.length, terms: items };
}
