import { toLocalDay } from '@/shared/utils';
import type { DayValue, ScoredAttempt } from '../model/types';
import { average, groupBy } from './groupBy.service';

/** Average shadowing score per local day, oldest day first. */
export function averageScoreByDay(attempts: readonly ScoredAttempt[]): DayValue[] {
  const byDay = groupBy(attempts, a => toLocalDay(new Date(a.createdAt)));
  return [...byDay.entries()]
    .map(([day, group]) => ({
      day,
      value: Math.round(average(group.map(a => a.score))),
      count: group.length,
    }))
    .sort((a, b) => a.day.localeCompare(b.day));
}
