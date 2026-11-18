// Azure en-US IPA phonemes → the sound contrasts drilled in minimal pairs (SOUNDS in
// features/minimal-pairs). Mirrors the server's soundKind table. "-ed" endings (t-ɪd) are not
// visible at phoneme level, so they come only from pair drills.
const PHONEME_SOUNDS: Readonly<Record<string, string>> = {
  θ: 'θ-s',
  ð: 'ð-d',
  w: 'w-v',
  v: 'w-v',
  ɪ: 'ɪ-iː',
  i: 'ɪ-iː',
  iː: 'ɪ-iː',
  ʊ: 'ʊ-uː',
  u: 'ʊ-uː',
  uː: 'ʊ-uː',
  æ: 'æ-e',
  ɛ: 'æ-e',
  e: 'æ-e',
};

/** The drilled sound contrast a phoneme belongs to, or null. */
export function phonemeToSound(phoneme: string): string | null {
  return PHONEME_SOUNDS[phoneme] ?? null;
}
