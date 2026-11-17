export type FillerCount = { count: number; fillers: string[] };

/** Each pattern is matched case-insensitively against the raw transcript (punctuation matters). */
const FILLER_PATTERNS: ReadonlyArray<{ name: string; pattern: RegExp }> = [
  { name: 'um', pattern: /\bu+m+\b/gi },
  { name: 'uh', pattern: /\bu+h+\b/gi },
  { name: 'er', pattern: /\berm*\b/gi },
  { name: 'hmm', pattern: /\bhm+\b/gi },
  { name: 'basically', pattern: /\bbasically\b/gi },
  { name: 'actually', pattern: /\bactually\b/gi },
  { name: 'literally', pattern: /\bliterally\b/gi },
  { name: 'you know', pattern: /\byou know\b(?=\s*[,.!?])/gi },
  { name: 'i mean', pattern: /\bi mean\b(?=\s*,)/gi },
  // "so" and "like" are fillers only in these positions: "So, we…", "it is, like, a…"
  { name: 'so', pattern: /(?:^|[.!?]\s+)so\b/gi },
  { name: 'like', pattern: /,\s*like\s*,/gi },
];

/** Counts filler words; `fillers` lists each kind once, in order of first appearance. */
export function countFillers(transcript: string): FillerCount {
  const hits: Array<{ name: string; index: number }> = [];
  for (const { name, pattern } of FILLER_PATTERNS) {
    for (const match of transcript.matchAll(pattern))
      hits.push({ name, index: match.index });
  }
  hits.sort((a, b) => a.index - b.index);
  return { count: hits.length, fillers: [...new Set(hits.map((h) => h.name))] };
}
