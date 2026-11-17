import type { PhonemeScore } from '@/services/speech';

/** "θ 5 · ɪ 90 · ŋ 70": each sound with its rounded accuracy, in spoken order. */
export function formatPhonemes(phonemes: readonly PhonemeScore[]): string {
  return phonemes.map(p => `${p.phoneme} ${Math.round(p.accuracy)}`).join(' · ');
}
