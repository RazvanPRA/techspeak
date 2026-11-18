import { type AliasMap, containsPhrase, normalizeTranscript } from '@/services/scoring';

/** "SSR / SSG" → both; "write-ahead log (WAL)" → "write-ahead log" and "WAL". */
function spokenForms(term: string): string[] {
  const parenthesised = [...term.matchAll(/\(([^)]+)\)/g)].map(m => m[1] ?? '');
  const withoutParens = term.replace(/\([^)]*\)/g, ' ');
  return [...withoutParens.split('/'), ...parenthesised].map(f => f.trim()).filter(Boolean);
}

/** True if the transcript contains the term (or one of its written alternatives). */
export function isTermRecognised(term: string, transcript: string, aliases: AliasMap): boolean {
  const spoken = normalizeTranscript(transcript, aliases);
  return spokenForms(term).some(form => containsPhrase(spoken, normalizeTranscript(form, aliases)));
}
