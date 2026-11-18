import type { TalkRecord } from '../model/records';

export type TalkComparison = { wordsPerMinute: number; fillersPerMinute: number };

/** Filler words per minute spoken, one decimal. */
export function fillersPerMinute(talk: TalkRecord): number {
  if (talk.durationSeconds <= 0) return 0;
  return Math.round((talk.fillers / (talk.durationSeconds / 60)) * 10) / 10;
}

/** How the latest talk differs from the baseline (positive = more than the baseline). */
export function compareTalks(baseline: TalkRecord, latest: TalkRecord): TalkComparison {
  return {
    wordsPerMinute: Math.round(latest.wordsPerMinute - baseline.wordsPerMinute),
    fillersPerMinute:
      Math.round((fillersPerMinute(latest) - fillersPerMinute(baseline)) * 10) / 10,
  };
}
