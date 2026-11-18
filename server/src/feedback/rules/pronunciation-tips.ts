import type { Deck } from '../../content/deck.schema.js';
import {
  type PhonemeInput,
  phonemeKind,
  SOUND_TIPS,
  spellingKind,
} from './sound-tips.js';

export const LOW_ACCURACY = 70;
const MAX_SCORED_TIPS = 6;
const MAX_TRAP_TIPS = 3;

export type ScoredWord = {
  word: string;
  accuracy: number;
  phonemes?: PhonemeInput[];
};
export type PronunciationTip = { word: string; ipa: string; tip: string };

type Input = {
  deck: Deck;
  usedTerms: readonly string[];
  scores?: readonly ScoredWord[];
};

const termOf = (deck: Deck, word: string) =>
  deck.terms.find((t) => t.term.toLowerCase() === word.toLowerCase());

/** A phoneme-specific tip beats the deck's hint; the deck's hint beats a spelling guess. */
function tipFor(
  deck: Deck,
  { word, phonemes = [] }: ScoredWord,
): PronunciationTip {
  const term = termOf(deck, word);
  const fromPhoneme = phonemeKind(phonemes);
  const tip = fromPhoneme
    ? SOUND_TIPS[fromPhoneme]
    : (term?.hint ?? SOUND_TIPS[spellingKind(word)]);
  return { word, ipa: term?.ipa ?? '', tip };
}

function fromScores(
  deck: Deck,
  scores: readonly ScoredWord[],
): PronunciationTip[] {
  const seen = new Set<string>();
  return [...scores]
    .filter((s) => s.accuracy < LOW_ACCURACY)
    .sort((a, b) => a.accuracy - b.accuracy)
    .filter(
      (s) => !seen.has(s.word.toLowerCase()) && seen.add(s.word.toLowerCase()),
    )
    .slice(0, MAX_SCORED_TIPS)
    .map((s) => tipFor(deck, s));
}

/** Without Azure scores: remind the pronunciation trap of the deck terms the answer used. */
function fromTraps(
  deck: Deck,
  usedTerms: readonly string[],
): PronunciationTip[] {
  return deck.terms
    .filter(
      (t) => usedTerms.includes(t.term) && (t.hint !== null || t.ipa !== null),
    )
    .slice(0, MAX_TRAP_TIPS)
    .map((t) => ({
      word: t.term,
      ipa: t.ipa ?? '',
      tip: t.hint ?? `Say it ${t.ipa}.`,
    }));
}

/** Words to work on: Azure's low-accuracy words if scores were sent, otherwise deck traps. */
export function pronunciationTips({
  deck,
  usedTerms,
  scores,
}: Input): PronunciationTip[] {
  return scores ? fromScores(deck, scores) : fromTraps(deck, usedTerms);
}
