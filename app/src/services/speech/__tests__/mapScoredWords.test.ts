import { mapScoredWords } from '../assessor/mapScoredWords.service';
import type { ServerWord } from '../assessor/assessmentResponse.schema';

const w = (word: string, accuracy: number, errorType = 'None'): ServerWord => ({
  word,
  accuracy,
  errorType,
  phonemes: [{ phoneme: 'x', accuracy }],
});

describe('mapScoredWords', () => {
  it('maps Azure words onto the target words one to one', () => {
    const { words, scored } = mapScoredWords(
      ['think', 'about', 'the', 'cache'],
      [w('Think', 38, 'Mispronunciation'), w('about', 96), w('the', 0, 'Omission'), w('cache,', 92)],
    );
    expect(words).toEqual([
      { kind: 'wrong', targetIndex: 0, word: 'think', spoken: 'Think' },
      { kind: 'ok', targetIndex: 1, word: 'about' },
      { kind: 'missing', targetIndex: 2, word: 'the' },
      { kind: 'ok', targetIndex: 3, word: 'cache' },
    ]);
    expect(scored.map(s => [s.targetIndex, s.accuracy])).toEqual([
      [0, 38],
      [1, 96],
      [2, 0],
      [3, 92],
    ]);
  });

  it('marks a low-accuracy word as wrong even without an error type', () => {
    const { words } = mapScoredWords(['queue'], [w('queue', 45)]);
    expect(words[0]?.kind).toBe('wrong');
  });

  it('keeps insertions as extra words with no target', () => {
    const { words, scored } = mapScoredWords(['go'], [w('um', 0, 'Insertion'), w('go', 90)]);
    expect(words).toEqual([
      { kind: 'ok', targetIndex: 0, word: 'go' },
      { kind: 'extra', spoken: 'um' },
    ]);
    expect(scored.find(s => s.word === 'um')?.targetIndex).toBeNull();
  });

  it('realigns by word when Azure split the sentence differently', () => {
    // target "nodejs" (one token) vs Azure "node" + "js"
    const { words } = mapScoredWords(
      ['use', 'nodejs', 'today'],
      [w('use', 90), w('node', 80), w('js', 80), w('today', 95)],
    );
    expect(words.filter(r => r.kind !== 'extra')).toEqual([
      { kind: 'ok', targetIndex: 0, word: 'use' },
      { kind: 'missing', targetIndex: 1, word: 'nodejs' },
      { kind: 'ok', targetIndex: 2, word: 'today' },
    ]);
  });

  it('marks every target missing when nothing was heard', () => {
    expect(mapScoredWords(['a', 'b'], []).words).toEqual([
      { kind: 'missing', targetIndex: 0, word: 'a' },
      { kind: 'missing', targetIndex: 1, word: 'b' },
    ]);
  });
});
