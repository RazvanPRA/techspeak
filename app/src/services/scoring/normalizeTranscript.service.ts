import { normalizeWord } from './normalizeWord.service';
import type { AliasMap } from './types';

const toWords = (text: string): string[] =>
  text.split(/\s+/).map(normalizeWord).filter(Boolean);

const escape = (s: string): string =>
  s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Splits a transcript into normalized words and maps spoken aliases ("sequel" → "sql"). */
export function normalizeTranscript(text: string, aliases: AliasMap = {}): string[] {
  let joined = toWords(text).join(' ');
  const entries = Object.entries(aliases)
    .map(([from, to]) => [toWords(from).join(' '), toWords(to).join(' ')] as const)
    .filter(([from]) => from.length > 0)
    .sort(([a], [b]) => b.length - a.length);
  for (const [from, to] of entries) {
    joined = joined.replace(new RegExp(`(^| )${escape(from)}(?= |$)`, 'g'), `$1${to}`);
  }
  return joined.split(' ').filter(Boolean);
}
