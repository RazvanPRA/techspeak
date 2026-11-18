import { MIN_SOUND_SAMPLES, WEAK_PHONEME_ACCURACY } from '../model/constants';
import type { PairResult, PhonemeResult, WeakSound } from '../model/types';
import { phonemeToSound } from './phonemeToSound.service';

type Tally = { errors: number; samples: number };

function tallyBySound(pairs: readonly PairResult[], phonemes: readonly PhonemeResult[]) {
  const tally = new Map<string, Tally>();
  const add = (sound: string, error: boolean) => {
    const t = tally.get(sound) ?? { errors: 0, samples: 0 };
    tally.set(sound, { errors: t.errors + (error ? 1 : 0), samples: t.samples + 1 });
  };
  pairs.forEach(p => add(p.sound, !p.correct));
  for (const p of phonemes) {
    const sound = phonemeToSound(p.phoneme);
    if (sound) add(sound, p.accuracy < WEAK_PHONEME_ACCURACY);
  }
  return tally;
}

/**
 * Sounds I get wrong most often, weakest first: minimal-pair mistakes plus Azure phonemes
 * below 60 accuracy. Sounds with too few samples or no mistakes are left out.
 */
export function rankWeakSounds(input: {
  pairs: readonly PairResult[];
  phonemes: readonly PhonemeResult[];
}): WeakSound[] {
  return [...tallyBySound(input.pairs, input.phonemes).entries()]
    .filter(([, t]) => t.samples >= MIN_SOUND_SAMPLES && t.errors > 0)
    .map(([sound, t]) => ({ sound, errorRate: t.errors / t.samples, samples: t.samples }))
    .sort((a, b) => b.errorRate - a.errorRate || b.samples - a.samples);
}
