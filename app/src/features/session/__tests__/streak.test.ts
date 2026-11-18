import { currentStreak, updateStreak } from '../services/updateStreak.service';
import { toLocalDay } from '@/shared/utils';

describe('toLocalDay', () => {
  it('uses the local calendar day, zero-padded', () => {
    expect(toLocalDay(new Date(2026, 0, 5, 9, 30))).toBe('2026-01-05');
  });

  it('keeps one minute before midnight on the same day', () => {
    expect(toLocalDay(new Date(2026, 10, 18, 23, 59))).toBe('2026-11-18');
    expect(toLocalDay(new Date(2026, 10, 19, 0, 0))).toBe('2026-11-19');
  });
});

describe('updateStreak', () => {
  const start = { lastDay: null, count: 0 };

  it('starts a streak of 1 on the first session', () => {
    expect(updateStreak(start, '2026-11-18')).toEqual({ lastDay: '2026-11-18', count: 1 });
  });

  it('does not count a second session on the same day', () => {
    const streak = { lastDay: '2026-11-18', count: 3 };
    expect(updateStreak(streak, '2026-11-18')).toEqual(streak);
  });

  it('adds one on the next day, also across a month and a year', () => {
    expect(updateStreak({ lastDay: '2026-11-18', count: 3 }, '2026-11-19').count).toBe(4);
    expect(updateStreak({ lastDay: '2026-11-30', count: 3 }, '2026-12-01').count).toBe(4);
    expect(updateStreak({ lastDay: '2026-12-31', count: 3 }, '2027-01-01').count).toBe(4);
  });

  it('counts the day after a DST change as the next day', () => {
    // Europe switches clocks on the last Sunday of March and October.
    expect(updateStreak({ lastDay: '2027-03-28', count: 2 }, '2027-03-29').count).toBe(3);
    expect(updateStreak({ lastDay: '2026-10-25', count: 2 }, '2026-10-26').count).toBe(3);
  });

  it('restarts at 1 after a missed day', () => {
    expect(updateStreak({ lastDay: '2026-11-16', count: 9 }, '2026-11-18')).toEqual({
      lastDay: '2026-11-18',
      count: 1,
    });
  });

  it('ignores a "today" that is before the last day (clock moved back)', () => {
    const streak = { lastDay: '2026-11-18', count: 3 };
    expect(updateStreak(streak, '2026-11-17')).toEqual(streak);
  });
});

describe('currentStreak', () => {
  it('is the stored count today and yesterday, 0 after a missed day', () => {
    const streak = { lastDay: '2026-11-18', count: 5 };
    expect(currentStreak(streak, '2026-11-18')).toBe(5);
    expect(currentStreak(streak, '2026-11-19')).toBe(5);
    expect(currentStreak(streak, '2026-11-20')).toBe(0);
    expect(currentStreak({ lastDay: null, count: 0 }, '2026-11-20')).toBe(0);
  });
});
