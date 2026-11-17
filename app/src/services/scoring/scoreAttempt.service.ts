import type { WordResult } from './types';

const EXTRA_WORD_PENALTY = 0.5;

/** 0–100: share of target words said correctly; each extra word counts as half a miss. */
export function scoreAttempt(results: readonly WordResult[]): number {
  const targetCount = results.filter(r => r.kind !== 'extra').length;
  if (targetCount === 0) return 0;
  const ok = results.filter(r => r.kind === 'ok').length;
  const extra = results.length - targetCount;
  return Math.round((100 * ok) / (targetCount + extra * EXTRA_WORD_PENALTY));
}
