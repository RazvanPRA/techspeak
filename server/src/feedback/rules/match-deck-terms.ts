import type { Deck } from '../../content/deck.schema.js';
import {
  containsPhrase,
  normalizeText,
  spokenForms,
} from '../../content/text/index.js';

export const MAX_MISSING_TERMS = 5;

export type DeckTermMatch = { used: string[]; missing: string[] };

/** True if the words contain the term or its plural ("isolation levels", "transactions"). */
const mentions = (words: readonly string[], term: string): boolean =>
  spokenForms(term).some(
    (form) =>
      containsPhrase(words, normalizeText(form)) ||
      containsPhrase(words, normalizeText(`${form}s`)),
  );

/** Deck terms the answer used, and up to five it could have used (prompt terms first). */
export function matchDeckTerms(
  deck: Deck,
  transcript: string,
  prompt: string,
): DeckTermMatch {
  const spoken = normalizeText(transcript);
  const promptWords = normalizeText(prompt);
  const terms = deck.terms.map((t) => t.term);
  const used = terms.filter((t) => mentions(spoken, t));
  const unused = terms.filter((t) => !used.includes(t));
  const inPrompt = (t: string) => mentions(promptWords, t);
  const missing = [
    ...unused.filter(inPrompt),
    ...unused.filter((t) => !inPrompt(t)),
  ];
  return { used, missing: missing.slice(0, MAX_MISSING_TERMS) };
}
