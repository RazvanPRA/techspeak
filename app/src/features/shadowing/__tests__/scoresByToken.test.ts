import type { AssessmentDetails, ScoredWord } from '@/services/speech';
import { scoresByToken } from '../services/scoresByToken.service';

const word = (targetIndex: number | null, accuracy: number): ScoredWord => ({
  targetIndex,
  word: 'w',
  accuracy,
  phonemes: [],
});

const details = (words: ScoredWord[]): AssessmentDetails => ({
  accuracy: 80,
  fluency: 80,
  completeness: 100,
  prosody: null,
  words,
});

describe('scoresByToken', () => {
  it('places each scored word at its token index', () => {
    const scores = scoresByToken(3, details([word(0, 90), word(2, 40)]));
    expect(scores.map(s => s?.accuracy ?? null)).toEqual([90, null, 40]);
  });

  it('ignores insertions and out-of-range indexes', () => {
    const scores = scoresByToken(2, details([word(null, 10), word(5, 10), word(-1, 10)]));
    expect(scores).toEqual([null, null]);
  });

  it('returns all nulls without details (speech-to-text scoring)', () => {
    expect(scoresByToken(2, null)).toEqual([null, null]);
  });
});
