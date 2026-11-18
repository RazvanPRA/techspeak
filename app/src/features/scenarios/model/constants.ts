/** Answer like in an interview: at least a minute, at most two (SPEC §3.4). */
export const MIN_ANSWER_SECONDS = 60;
export const MAX_ANSWER_SECONDS = 120;
/** How many deck terms are passed to Whisper as recognition hints. */
export const HINT_TERMS = 15;
/** Questions in one mock interview (SPEC §3.4). */
export const INTERVIEW_QUESTIONS = 5;
/** A comfortable pace in words per minute (same range as the Fluency card and the server). */
export const PACE_RANGE = { min: 110, max: 170 } as const;
/** More filler words per minute than this is worth working on. */
export const FILLERS_PER_MINUTE_LIMIT = 2;
/** The interview summary shows this many issues. */
export const TOP_ISSUES = 3;
/** The talk check is a 3-minute talk. */
export const TALK_SECONDS = 180;
