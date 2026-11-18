import type { MinimalPair, Sound } from '../model/types';

export const makePair = (a: string, b: string, sound: Sound = 'θ-s'): MinimalPair => ({
  id: `${a}-${b}`,
  sound,
  a: { word: a, ipa: `/${a}/` },
  b: { word: b, ipa: `/${b}/` },
  tip: `Tip for ${sound}`,
});

/** A deterministic "random" source that returns the given values in turn (then repeats the last). */
export function sequence(...values: number[]): () => number {
  let i = 0;
  return () => values[Math.min(i++, values.length - 1)] ?? 0;
}
