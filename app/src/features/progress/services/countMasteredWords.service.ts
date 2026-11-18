import { MASTERED_INTERVAL_DAYS } from '../model/constants';
import type { ReviewInterval } from '../model/types';

/** Vocabulary terms whose SM-2 interval reached three weeks. */
export function countMasteredWords(states: readonly ReviewInterval[]): number {
  return states.filter(s => s.interval >= MASTERED_INTERVAL_DAYS).length;
}
