import type { AttemptRecord } from '../model/types';

/** How often each (normalized) target word was wrong or missing across the given attempts. */
export function countMissedWords(records: readonly AttemptRecord[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const record of records) {
    for (const word of record.words) {
      if (word.kind !== 'wrong' && word.kind !== 'missing') continue;
      counts.set(word.word, (counts.get(word.word) ?? 0) + 1);
    }
  }
  return counts;
}
