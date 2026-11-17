import type { Grade } from './types';

/** SM-2 defaults. */
export const INITIAL_EASE = 2.5;
export const MIN_EASE = 1.3;
/** Grades below this count as a lapse. */
export const PASS_GRADE = 3;

/** A term recognised on the first try, and on a later try. */
export const RECOGNISED_FIRST_GRADE: Grade = 5;
export const RECOGNISED_RETRY_GRADE: Grade = 4;

/** Self-grade buttons shown when the term was not recognised. */
export const SELF_GRADES = [
  { key: 'again', grade: 1 },
  { key: 'hard', grade: 3 },
  { key: 'good', grade: 4 },
  { key: 'easy', grade: 5 },
] as const satisfies ReadonlyArray<{ key: string; grade: Grade }>;

/** Review session size. */
export const MAX_CARDS_PER_SESSION = 20;
export const MAX_NEW_CARDS_PER_SESSION = 10;
export const WEAK_WORDS_LIMIT = 20;

export const TERM_RATE = 0.8;
