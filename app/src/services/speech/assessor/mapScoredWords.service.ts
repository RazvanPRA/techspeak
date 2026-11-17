import { normalizeWord, type WordResult } from '@/services/scoring';
import type { ScoredWord } from '../model/types';
import type { ServerWord } from './assessmentResponse.schema';

/** Below this accuracy a word counts as wrong, whatever Azure's error type says. */
export const WRONG_BELOW_ACCURACY = 60;
/** How far ahead to look for a target word when Azure tokenised the sentence differently. */
const LOOKAHEAD = 3;

type Mapped = { words: WordResult[]; scored: ScoredWord[] };

function toResult(targetIndex: number, target: string, w: ServerWord): WordResult {
  if (w.errorType === 'Omission') return { kind: 'missing', targetIndex, word: target };
  if (w.errorType === 'Mispronunciation' || w.accuracy < WRONG_BELOW_ACCURACY) {
    return { kind: 'wrong', targetIndex, word: target, spoken: w.word };
  }
  return { kind: 'ok', targetIndex, word: target };
}

/** Index of the next reference word matching `target`, within the lookahead, or -1. */
function findNext(reference: readonly ServerWord[], from: number, target: string, oneToOne: boolean) {
  if (oneToOne) return from;
  const end = Math.min(from + LOOKAHEAD, reference.length);
  for (let k = from; k < end; k++) {
    if (normalizeWord(reference[k]?.word ?? '') === target) return k;
  }
  return -1;
}

/** Aligns Azure's scored words with the target words (normalized tokens of the sentence). */
export function mapScoredWords(targets: readonly string[], serverWords: readonly ServerWord[]): Mapped {
  const reference = serverWords.filter(w => w.errorType !== 'Insertion');
  const oneToOne = reference.length === targets.length;
  const words: WordResult[] = [];
  const scored: ScoredWord[] = [];
  let next = 0;
  targets.forEach((target, i) => {
    const k = findNext(reference, next, target, oneToOne);
    const match = k >= 0 ? reference[k] : undefined;
    if (!match) {
      words.push({ kind: 'missing', targetIndex: i, word: target });
      return;
    }
    next = k + 1;
    words.push(toResult(i, target, match));
    scored.push({ targetIndex: i, word: match.word, accuracy: match.accuracy, phonemes: match.phonemes });
  });
  for (const w of serverWords.filter(s => s.errorType === 'Insertion')) {
    words.push({ kind: 'extra', spoken: w.word });
    scored.push({ targetIndex: null, word: w.word, accuracy: w.accuracy, phonemes: w.phonemes });
  }
  return { words, scored };
}
