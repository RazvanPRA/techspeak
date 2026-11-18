import type { AssessmentDetails, ScoredWord } from '@/services/speech';

/** Azure's word scores indexed by sentence token (null where a token has no score). */
export function scoresByToken(
  tokenCount: number,
  details: AssessmentDetails | null,
): Array<ScoredWord | null> {
  const scores: Array<ScoredWord | null> = Array.from({ length: tokenCount }, () => null);
  for (const word of details?.words ?? []) {
    const i = word.targetIndex;
    if (i !== null && i >= 0 && i < tokenCount) scores[i] = word;
  }
  return scores;
}
