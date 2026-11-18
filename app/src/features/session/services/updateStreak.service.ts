import type { Streak } from '@/services/settings';

const DAY_MS = 24 * 60 * 60 * 1000;

/** Whole days from `from` to `to` ("YYYY-MM-DD"). Uses UTC dates, so DST never adds an hour. */
function daysBetween(from: string, to: string): number {
  const toUtc = (day: string) => {
    const [y, m, d] = day.split('-').map(Number);
    return Date.UTC(y ?? 0, (m ?? 1) - 1, d ?? 1);
  };
  return Math.round((toUtc(to) - toUtc(from)) / DAY_MS);
}

/** The streak after finishing a session on `today` (a local day, see toLocalDay). */
export function updateStreak(streak: Streak, today: string): Streak {
  if (streak.lastDay === null) return { lastDay: today, count: 1 };
  const gap = daysBetween(streak.lastDay, today);
  if (gap <= 0) return streak;
  return { lastDay: today, count: gap === 1 ? streak.count + 1 : 1 };
}

/** The streak to show on `today`: still alive until the end of the day after the last session. */
export function currentStreak(streak: Streak, today: string): number {
  if (streak.lastDay === null) return 0;
  return daysBetween(streak.lastDay, today) <= 1 ? streak.count : 0;
}
