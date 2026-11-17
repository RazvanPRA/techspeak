export const LONG_SENTENCE_WORDS = 35;

/** Sentences over 35 words: hard to follow when spoken. */
export function findLongSentences(transcript: string): string[] {
  return transcript
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.split(/\s+/).filter(Boolean).length > LONG_SENTENCE_WORDS);
}
