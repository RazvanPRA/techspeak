import { toLocalDay } from '@/shared/utils';
import type { FluencyPoint, FluencySample } from '../model/types';
import { average, groupBy } from './groupBy.service';

const round1 = (n: number) => Math.round(n * 10) / 10;

/** Scenario pace and filler words per local day, oldest first. Fillers are per minute spoken. */
export function fluencyTrend(answers: readonly FluencySample[]): FluencyPoint[] {
  const timed = answers.filter(a => a.durationSeconds > 0);
  const byDay = groupBy(timed, a => toLocalDay(new Date(a.createdAt)));
  return [...byDay.entries()]
    .map(([day, group]) => {
      const minutes = group.reduce((s, a) => s + a.durationSeconds, 0) / 60;
      const fillers = group.reduce((s, a) => s + a.fillers, 0);
      return {
        day,
        wordsPerMinute: Math.round(average(group.map(a => a.wordsPerMinute))),
        fillersPerMinute: round1(fillers / minutes),
      };
    })
    .sort((a, b) => a.day.localeCompare(b.day));
}
