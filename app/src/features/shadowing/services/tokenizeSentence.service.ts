import type { Term } from '@/features/vocabulary';
import { normalizeWord } from '@/services/scoring';
import type { SentenceToken } from '../model/types';
import { findTargetWords } from './findTargetWords.service';

/**
 * Splits a sentence into display words (punctuation stays attached for display) and
 * links target words to their deck term. Tokens that normalize to nothing ("—") are dropped,
 * so token indexes equal the diff's target indexes.
 */
export function tokenizeSentence(sentence: string, terms: readonly Term[]): SentenceToken[] {
  const words = sentence
    .split(/\s+/)
    .map(text => ({ text, normalized: normalizeWord(text) }))
    .filter(w => w.normalized !== '');
  const targets = findTargetWords(
    words.map(w => w.normalized),
    terms,
  );
  return words.map((w, i) => ({ ...w, term: targets[i] ?? null }));
}

/** Unique term names in the sentence, used as recognition hints. */
export function targetTermNames(tokens: readonly SentenceToken[]): string[] {
  return [...new Set(tokens.flatMap(t => (t.term ? [t.term.term] : [])))];
}
