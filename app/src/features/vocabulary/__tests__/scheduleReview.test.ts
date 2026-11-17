import type { Grade, ReviewState } from '../model/types';
import { createReviewState } from '../services/createReviewState.service';
import { scheduleReview } from '../services/scheduleReview.service';

// Due dates use local calendar days, so pin a time zone with a DST change (29 Mar 2026, 03:00 → 04:00).
// Jest workers are reused across files, so restore the zone afterwards.
const originalTz = process.env.TZ;
process.env.TZ = 'Europe/Bucharest';
afterAll(() => {
  process.env.TZ = originalTz;
});

const NOW = new Date(2026, 10, 17, 9, 0); // 17 Nov 2026, 09:00 local
const fresh = (): ReviewState => createReviewState('sql', 'query', NOW);

function reviewMany(grades: Grade[], start: ReviewState = fresh()): ReviewState {
  return grades.reduce((card, grade) => scheduleReview(card, grade, NOW), start);
}

describe('createReviewState', () => {
  it('starts a new card with the SM-2 defaults, due now', () => {
    expect(fresh()).toEqual({
      deckId: 'sql',
      term: 'query',
      ease: 2.5,
      interval: 0,
      repetitions: 0,
      lapses: 0,
      dueAt: NOW.toISOString(),
    });
  });
});

describe('scheduleReview', () => {
  it('schedules the first successful review for tomorrow', () => {
    const card = scheduleReview(fresh(), 4, NOW);
    expect(card).toMatchObject({ repetitions: 1, interval: 1, ease: 2.5, lapses: 0 });
    expect(card.dueAt).toBe(new Date(2026, 10, 18, 9, 0).toISOString());
  });

  it('uses 6 days for the second pass, then interval × ease', () => {
    expect(reviewMany([4, 4]).interval).toBe(6);
    expect(reviewMany([4, 4, 4]).interval).toBe(15); // round(6 × 2.5)
  });

  it('raises the ease for an easy answer and lowers it for a hard one', () => {
    expect(scheduleReview(fresh(), 5, NOW).ease).toBeCloseTo(2.6);
    expect(scheduleReview(fresh(), 3, NOW).ease).toBeCloseTo(2.36);
  });

  it('computes the next interval with the ease before this review', () => {
    const card = reviewMany([5, 5, 5]); // eases 2.6, 2.7, 2.8 → 6 × 2.7
    expect(card.interval).toBe(16);
    expect(card.ease).toBeCloseTo(2.8);
  });

  it('a lapse resets repetitions, schedules tomorrow and counts the lapse', () => {
    const card = scheduleReview(reviewMany([4, 4, 4]), 1, NOW);
    expect(card).toMatchObject({ repetitions: 0, interval: 1, lapses: 1 });
    expect(card.ease).toBeCloseTo(1.96);
    expect(scheduleReview(card, 4, NOW).interval).toBe(1);
  });

  it('never lets the ease fall below 1.3', () => {
    expect(reviewMany([0, 0, 0, 0, 0, 0]).ease).toBe(1.3);
  });

  it.each([-1, 6, 2.5, Number.NaN])('throws for the invalid grade %p', grade => {
    expect(() => scheduleReview(fresh(), grade as Grade, NOW)).toThrow(RangeError);
  });

  it('does not mutate the input card', () => {
    const card = fresh();
    scheduleReview(card, 5, NOW);
    expect(card).toEqual(fresh());
  });

  it('keeps the local time of day across a DST change', () => {
    const beforeDst = new Date(2026, 2, 28, 9, 0); // 28 Mar, the day before clocks go forward
    const card = scheduleReview(createReviewState('sql', 'query', beforeDst), 4, beforeDst);
    const due = new Date(card.dueAt);
    expect([due.getDate(), due.getHours(), due.getMinutes()]).toEqual([29, 9, 0]);
    expect(due.getTime() - beforeDst.getTime()).toBe(23 * 60 * 60 * 1000);
  });
});
