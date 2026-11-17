/** Speaking rate, rounded. 0 when the duration is not a positive number. */
export function wordsPerMinute(wordCount: number, durationSeconds: number): number {
  if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) return 0;
  return Math.round((wordCount * 60) / durationSeconds);
}
