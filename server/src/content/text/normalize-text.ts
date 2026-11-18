import { SPOKEN_ALIASES } from './aliases.js';

/** Lowercases and keeps only letters, digits and apostrophes ("Node.js" → "nodejs"). */
export function normalizeWord(word: string): string {
  return word
    .toLowerCase()
    .replace(/[’`]/g, "'")
    .replace(/[^\p{L}\p{N}']/gu, '')
    .replace(/^'+|'+$/g, '');
}

const toWords = (text: string): string[] =>
  text.split(/\s+/).map(normalizeWord).filter(Boolean);

const escape = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const ALIAS_ENTRIES = Object.entries(SPOKEN_ALIASES)
  .map(
    ([from, to]) => [toWords(from).join(' '), toWords(to).join(' ')] as const,
  )
  .sort(([a], [b]) => b.length - a.length);

/** Splits a transcript into normalized words and maps spoken aliases ("sequel" → "sql"). */
export function normalizeText(text: string): string[] {
  let joined = toWords(text).join(' ');
  for (const [from, to] of ALIAS_ENTRIES) {
    joined = joined.replace(
      new RegExp(`(^| )${escape(from)}(?= |$)`, 'g'),
      `$1${to}`,
    );
  }
  return joined.split(' ').filter(Boolean);
}
