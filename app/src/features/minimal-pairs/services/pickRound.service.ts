import type { MinimalPair, Round } from '../model/types';

/**
 * Picks a random pair and a random side to drill. `random` returns [0, 1) like Math.random.
 * The previous pair is skipped when another one is available.
 */
export function pickRound(
  pairs: readonly MinimalPair[],
  random: () => number,
  previousId?: string,
): Round {
  if (pairs.length === 0) throw new Error('There are no minimal pairs to drill');
  const others = pairs.filter(p => p.id !== previousId);
  const candidates = others.length > 0 ? others : pairs;
  const index = Math.min(Math.floor(random() * candidates.length), candidates.length - 1);
  const pair = candidates[index] ?? candidates[0]!; // non-empty: checked above
  const side = random() < 0.5 ? 'a' : 'b';
  return side === 'a'
    ? { pair, side, target: pair.a, other: pair.b }
    : { pair, side, target: pair.b, other: pair.a };
}
