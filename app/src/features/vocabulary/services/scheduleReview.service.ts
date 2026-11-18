import { MIN_EASE, PASS_GRADE } from '../model/constants';
import type { Grade, ReviewState } from '../model/types';

/** Adds calendar days in local time, so the time of day survives DST changes. */
function addLocalDays(date: Date, days: number): Date {
  const result = new Date(date.getTime());
  result.setDate(result.getDate() + days);
  return result;
}

function nextEase(ease: number, grade: Grade): number {
  const miss = 5 - grade;
  const updated = ease + (0.1 - miss * (0.08 + miss * 0.02));
  return Math.max(MIN_EASE, Math.round(updated * 100) / 100);
}

function nextInterval(card: ReviewState, repetitions: number): number {
  if (repetitions === 1) return 1;
  if (repetitions === 2) return 6;
  return Math.round(card.interval * card.ease);
}

/**
 * SM-2: returns the card's next state after a review graded 0–5 at `now`.
 * A grade below 3 is a lapse: repetitions restart and the card is due tomorrow.
 */
export function scheduleReview(card: ReviewState, grade: Grade, now: Date): ReviewState {
  if (!Number.isInteger(grade) || grade < 0 || grade > 5) {
    throw new RangeError(`Grade must be an integer from 0 to 5 (got ${grade})`);
  }
  const passed = grade >= PASS_GRADE;
  const repetitions = passed ? card.repetitions + 1 : 0;
  const interval = passed ? nextInterval(card, repetitions) : 1;
  return {
    ...card,
    ease: nextEase(card.ease, grade),
    interval,
    repetitions,
    lapses: passed ? card.lapses : card.lapses + 1,
    dueAt: addLocalDays(now, interval).toISOString(),
  };
}
