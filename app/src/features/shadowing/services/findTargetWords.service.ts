import type { Term } from '@/features/vocabulary';
import { normalizeWord } from '@/services/scoring';

const MIN_STEM_LENGTH = 4;
const MAX_SUFFIX_LENGTH = 4;
const MIN_FAMILY_PREFIX = 5;
const FAMILY_RATIO = 0.75;
/** Single words of a multi-word term that may be highlighted on their own. */
const MIN_PARTIAL_LENGTH = 5;

/** "render" → [render], "cache" → [cache, cach], "query" → [query, quer]. */
function stemsOf(termWord: string): string[] {
  const last = termWord.at(-1);
  return last === 'e' || last === 'y' ? [termWord, termWord.slice(0, -1)] : [termWord];
}

/** renders, rolled, caching, queries. */
function isInflection(termWord: string, word: string): boolean {
  return stemsOf(termWord).some(
    stem => word.startsWith(stem) && word.length - stem.length <= MAX_SUFFIX_LENGTH,
  );
}

function sharedPrefixLength(a: string, b: string): number {
  let n = 0;
  while (n < a.length && n < b.length && a[n] === b[n]) n++;
  return n;
}

/** memoize ~ memoization, infer ~ inference, invalidates ~ invalidation. */
function isSameFamily(termWord: string, word: string): boolean {
  const prefix = sharedPrefixLength(termWord, word);
  const shorter = Math.min(termWord.length, word.length);
  return prefix >= MIN_FAMILY_PREFIX && prefix >= FAMILY_RATIO * shorter;
}

/** Exact match, a simple inflection or the same word family ("re-renders" counts as "renders"). */
export function wordMatches(termWord: string, word: string): boolean {
  if (word === termWord) return true;
  if (termWord.length < MIN_STEM_LENGTH) return false;
  const unprefixed = word.startsWith('re') ? word.slice(2) : '';
  const forms = unprefixed.length >= MIN_STEM_LENGTH ? [word, unprefixed] : [word];
  return forms.some(form => isInflection(termWord, form) || isSameFamily(termWord, form));
}

/** "spin up / tear down" → [["spin","up"], ["tear","down"]]. */
function variantsOf(term: Term): string[][] {
  return term.term
    .split('/')
    .map(v => v.split(/\s+/).map(normalizeWord).filter(Boolean))
    .filter(words => words.length > 0);
}

function matchesAt(words: readonly string[], variant: string[], start: number): boolean {
  return variant.every((termWord, k) => {
    const word = words[start + k];
    return word !== undefined && wordMatches(termWord, word);
  });
}

type Candidate = { term: Term; variant: string[] };

/** Whole terms first (longest first), then single long words of multi-word terms. */
function candidatesOf(terms: readonly Term[]): Candidate[] {
  const full = terms
    .flatMap(term => variantsOf(term).map(variant => ({ term, variant })))
    .sort((a, b) => b.variant.length - a.variant.length);
  const partial = full
    .filter(c => c.variant.length > 1)
    .flatMap(c =>
      c.variant.filter(w => w.length >= MIN_PARTIAL_LENGTH).map(w => ({ term: c.term, variant: [w] })),
    );
  return [...full, ...partial];
}

/** For each normalized sentence word, the deck term it belongs to (longest terms win). */
export function findTargetWords(words: readonly string[], terms: readonly Term[]): (Term | null)[] {
  const result: (Term | null)[] = words.map(() => null);
  for (const { term, variant } of candidatesOf(terms)) {
    for (let start = 0; start + variant.length <= words.length; start++) {
      const free = variant.every((_, k) => result[start + k] === null);
      if (free && matchesAt(words, variant, start)) {
        variant.forEach((_, k) => (result[start + k] = term));
      }
    }
  }
  return result;
}
