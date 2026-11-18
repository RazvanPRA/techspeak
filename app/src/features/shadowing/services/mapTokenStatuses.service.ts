import type { WordResult } from '@/services/scoring';
import type { TokenStatus } from '../model/types';

/** Status per sentence token (by target index); tokens without a result stay "pending". */
export function mapTokenStatuses(
  tokenCount: number,
  words: readonly WordResult[] | null,
): TokenStatus[] {
  const statuses: TokenStatus[] = Array.from({ length: tokenCount }, () => 'pending');
  for (const word of words ?? []) {
    if (word.kind !== 'extra' && word.targetIndex < tokenCount) {
      statuses[word.targetIndex] = word.kind;
    }
  }
  return statuses;
}

/** Words that were said but are not in the sentence. */
export function extraWords(words: readonly WordResult[] | null): string[] {
  return (words ?? []).flatMap(w => (w.kind === 'extra' ? [w.spoken] : []));
}
