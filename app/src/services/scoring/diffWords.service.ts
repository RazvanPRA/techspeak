import type { WordResult } from './types';

type Matrix = number[][];

function buildDistanceMatrix(target: string[], spoken: string[]): Matrix {
  const m: Matrix = Array.from({ length: target.length + 1 }, (_, i) =>
    Array.from({ length: spoken.length + 1 }, (__, j) => (i === 0 ? j : j === 0 ? i : 0)),
  );
  for (let i = 1; i <= target.length; i++) {
    for (let j = 1; j <= spoken.length; j++) {
      const same = target[i - 1] === spoken[j - 1] ? 0 : 1;
      m[i]![j] = Math.min(m[i - 1]![j - 1]! + same, m[i - 1]![j]! + 1, m[i]![j - 1]! + 1);
    }
  }
  return m;
}

function backtrack(m: Matrix, target: string[], spoken: string[]): WordResult[] {
  const out: WordResult[] = [];
  let i = target.length;
  let j = spoken.length;
  while (i > 0 || j > 0) {
    const cell = m[i]![j]!;
    const word = target[i - 1] ?? '';
    const said = spoken[j - 1] ?? '';
    const diagonal = i > 0 && j > 0 ? m[i - 1]![j - 1]! : Infinity;
    // Tie-break order (walking back from the end): match, missing, wrong, extra.
    // Preferring "missing" over "wrong" keeps substitutions early in the sentence.
    if (word === said && cell === diagonal) {
      out.push({ kind: 'ok', targetIndex: i - 1, word });
      i--; j--;
    } else if (i > 0 && cell === m[i - 1]![j]! + 1) {
      out.push({ kind: 'missing', targetIndex: i - 1, word });
      i--;
    } else if (cell === diagonal + 1) {
      out.push({ kind: 'wrong', targetIndex: i - 1, word, spoken: said });
      i--; j--;
    } else {
      out.push({ kind: 'extra', spoken: said });
      j--;
    }
  }
  return out.reverse();
}

/** Aligns spoken words to target words (Levenshtein) and labels each ok / wrong / missing / extra. */
export function diffWords(target: string[], spoken: string[]): WordResult[] {
  const t = target.filter(Boolean);
  const s = spoken.filter(Boolean);
  return backtrack(buildDistanceMatrix(t, s), t, s);
}
