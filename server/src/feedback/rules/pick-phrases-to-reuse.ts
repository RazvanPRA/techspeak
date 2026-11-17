import type { Deck } from '../../content/deck.schema.js';
import { containsPhrase, normalizeText } from '../../content/text/index.js';

export const PHRASES_TO_REUSE = 3;
const MISSING_TERM_WEIGHT = 2;
const MIN_CONTENT_WORD = 4; // ignores "the", "and", "how"…

function score(
  sentence: string,
  promptWords: ReadonlySet<string>,
  missing: readonly string[],
) {
  const words = normalizeText(sentence);
  const overlap = new Set(
    words.filter((w) => w.length >= MIN_CONTENT_WORD && promptWords.has(w)),
  ).size;
  const terms = missing.filter((t) =>
    containsPhrase(words, normalizeText(t)),
  ).length;
  return overlap + MISSING_TERM_WEIGHT * terms;
}

/** Three model sentences from the deck, preferring ones with missing terms and prompt words. */
export function pickPhrasesToReuse(
  deck: Deck,
  prompt: string,
  missingTerms: readonly string[],
): string[] {
  const examples = deck.terms.flatMap((t) => (t.example ? [t.example] : []));
  const candidates = [...new Set([...examples, ...deck.sentences])];
  const promptWords = new Set(normalizeText(prompt));
  return candidates
    .map((sentence, order) => ({
      sentence,
      order,
      score: score(sentence, promptWords, missingTerms),
    }))
    .sort((a, b) => b.score - a.score || a.order - b.order)
    .slice(0, PHRASES_TO_REUSE)
    .map((c) => c.sentence);
}
