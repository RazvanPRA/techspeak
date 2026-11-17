export type PhonemeInput = { phoneme: string; accuracy: number };

/** Short articulation tips for the sounds Romanian speakers find hardest (SPEC §1.2). */
export const SOUND_TIPS = {
  th: 'For "th", put the tongue tip between your teeth and blow: /θ/ in "think" is voiceless, /ð/ in "this" is voiced. Not "s", "t", "d" or "z".',
  wv: '"w" is rounded lips and no teeth ("west"); "v" is top teeth on the lower lip ("vest").',
  vowel:
    'Short /ɪ/ ("ship") is quick and relaxed; long /iː/ ("sheep") is longer, with spread lips.',
  ed: '"-ed" is /t/ after voiceless sounds ("walked"), /d/ after voiced ones ("played"), and /ɪd/ only after t or d ("wanted").',
  silent:
    'This word has a silent letter: say it the way it sounds, not the way it is spelled.',
  stress:
    'Check the word stress: make the stressed syllable louder and longer, and reduce the others to a short "uh" (schwa).',
} as const;

export type SoundKind = keyof typeof SOUND_TIPS;

const SILENT_LETTER_WORDS = new Set([
  'column',
  'foreign',
  'guard',
  'debt',
  'design',
  'sign',
  'knowledge',
  'island',
  'wednesday',
  'listen',
  'half',
  'walk',
  'talk',
  'could',
  'should',
  'would',
  'know',
  'write',
  'hour',
  'honest',
  'queue',
  'subtle',
  'receipt',
  'scheme',
  'align',
]);

const PHONEME_KINDS: ReadonlyArray<[RegExp, SoundKind]> = [
  [/^[θð]$/, 'th'],
  [/^[wv]$/, 'wv'],
  [/^(ɪ|i|iː)$/, 'vowel'],
];

const SPELLING_KINDS: ReadonlyArray<[RegExp, SoundKind]> = [
  [/th/, 'th'],
  [/[^aeiou]ed$/, 'ed'],
  [/^w|v/, 'wv'],
  [/ee|ea|ie/, 'vowel'],
];

/** The tip for the word's worst phoneme, or null if that sound has no specific tip. */
export function phonemeKind(
  phonemes: readonly PhonemeInput[],
): SoundKind | null {
  const worst = [...phonemes].sort((a, b) => a.accuracy - b.accuracy)[0];
  if (!worst) return null;
  return (
    PHONEME_KINDS.find(([pattern]) => pattern.test(worst.phoneme))?.[1] ?? null
  );
}

/** A best guess from the spelling alone; word stress when nothing else fits. */
export function spellingKind(word: string): SoundKind {
  const lower = word.toLowerCase();
  if (SILENT_LETTER_WORDS.has(lower)) return 'silent';
  return (
    SPELLING_KINDS.find(([pattern]) => pattern.test(lower))?.[1] ?? 'stress'
  );
}

/** Which tip fits a mispronounced word: its worst phoneme first, then its spelling. */
export function soundKind(
  word: string,
  phonemes: readonly PhonemeInput[] = [],
): SoundKind {
  return phonemeKind(phonemes) ?? spellingKind(word);
}
