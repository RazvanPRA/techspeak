import type { MinimalPair } from '../model/types';

/** The pairs that drill `sound`; every pair when there is no focus or no pair for it. */
export function pairsForSound(
  pairs: readonly MinimalPair[],
  sound: string | null | undefined,
): readonly MinimalPair[] {
  if (!sound) return pairs;
  const focused = pairs.filter(p => p.sound === sound);
  return focused.length > 0 ? focused : pairs;
}
