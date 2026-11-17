import { diffWords } from '../diffWords.service';

const kinds = (t: string[], s: string[]) => diffWords(t, s).map(r => r.kind);

describe('diffWords', () => {
  it('marks a perfect match as ok', () => {
    expect(kinds(['a', 'b', 'c'], ['a', 'b', 'c'])).toEqual(['ok', 'ok', 'ok']);
  });
  it('detects a wrong word', () => {
    expect(diffWords(['think', 'fast'], ['sink', 'fast'])[0]).toEqual({
      kind: 'wrong', targetIndex: 0, word: 'think', spoken: 'sink',
    });
  });
  it('detects a missing word', () => {
    expect(kinds(['use', 'the', 'index'], ['use', 'index'])).toEqual(['ok', 'missing', 'ok']);
  });
  it('detects an extra word', () => {
    expect(kinds(['use', 'index'], ['use', 'um', 'index'])).toEqual(['ok', 'extra', 'ok']);
  });
  it('keeps target indexes in order', () => {
    const idx = diffWords(['a', 'b', 'c'], ['a', 'x', 'c']).flatMap(r => ('targetIndex' in r ? [r.targetIndex] : []));
    expect(idx).toEqual([0, 1, 2]);
  });
  it('handles duplicate words', () => {
    expect(kinds(['the', 'cat', 'the', 'dog'], ['the', 'dog'])).toEqual(['missing', 'missing', 'ok', 'ok']);
  });
  it('returns all missing when nothing was said', () => {
    expect(kinds(['a', 'b'], [])).toEqual(['missing', 'missing']);
  });
  it('returns all extra when there is no target', () => {
    expect(kinds([], ['a', 'b'])).toEqual(['extra', 'extra']);
  });
  it('returns [] for two empty inputs and ignores empty strings', () => {
    expect(diffWords([], [])).toEqual([]);
    expect(kinds(['', 'a'], ['a', ''])).toEqual(['ok']);
  });
});
