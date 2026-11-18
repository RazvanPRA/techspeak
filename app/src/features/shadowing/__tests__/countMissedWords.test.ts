import type { AttemptRecord } from '../model/types';
import { countMissedWords } from '../services/countMissedWords.service';

const record = (words: AttemptRecord['words']): AttemptRecord => ({
  deckId: 'sql',
  sentenceIndex: 0,
  score: 50,
  transcript: '',
  audioPath: '/a.wav',
  createdAt: '2026-11-17T10:00:00.000Z',
  words,
});

describe('countMissedWords', () => {
  it('counts wrong and missing words across attempts', () => {
    const counts = countMissedWords([
      record([
        { kind: 'wrong', targetIndex: 0, word: 'query', spoken: 'curry' },
        { kind: 'ok', targetIndex: 1, word: 'index' },
      ]),
      record([
        { kind: 'missing', targetIndex: 0, word: 'query' },
        { kind: 'missing', targetIndex: 1, word: 'column' },
      ]),
    ]);
    expect(Object.fromEntries(counts)).toEqual({ query: 2, column: 1 });
  });

  it('ignores ok and extra words', () => {
    const counts = countMissedWords([
      record([
        { kind: 'ok', targetIndex: 0, word: 'index' },
        { kind: 'extra', spoken: 'um' },
      ]),
    ]);
    expect(counts.size).toBe(0);
  });

  it('returns an empty map for no attempts', () => {
    expect(countMissedWords([]).size).toBe(0);
  });
});
