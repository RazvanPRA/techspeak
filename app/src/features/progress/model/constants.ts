/** A term counts as mastered once SM-2 schedules it three weeks or more ahead. */
export const MASTERED_INTERVAL_DAYS = 21;
/** An Azure phoneme below this accuracy counts as a mistake on its sound. */
export const WEAK_PHONEME_ACCURACY = 60;
/** A sound needs this many samples before it is ranked. */
export const MIN_SOUND_SAMPLES = 3;
/** How many recent records feed the charts. */
export const RECENT_LIMIT = 500;
/** Days shown on the trend charts. */
export const TREND_DAYS = 14;
/** Scores are 0–100, so score charts share one scale. */
export const SCORE_MAX = 100;
