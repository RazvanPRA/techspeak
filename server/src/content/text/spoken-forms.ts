/** "SSR / SSG" → both; "write-ahead log (WAL)" → "write-ahead log" and "WAL". */
export function spokenForms(term: string): string[] {
  const parenthesised = [...term.matchAll(/\(([^)]+)\)/g)].map(
    (m) => m[1] ?? '',
  );
  const withoutParens = term.replace(/\([^)]*\)/g, ' ');
  return [...withoutParens.split('/'), ...parenthesised]
    .map((f) => f.trim())
    .filter(Boolean);
}
