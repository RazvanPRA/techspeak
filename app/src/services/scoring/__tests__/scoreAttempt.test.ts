import { diffWords } from '../diffWords.service';
import { scoreAttempt } from '../scoreAttempt.service';

const score = (t: string, s: string) => scoreAttempt(diffWords(t.split(' '), s.split(' ').filter(Boolean)));

describe('scoreAttempt', () => {
  it('gives 100 for a perfect attempt', () => {
    expect(score('a b c d', 'a b c d')).toBe(100);
  });
  it('gives 75 for one wrong word in four', () => {
    expect(score('a b c d', 'a x c d')).toBe(75);
  });
  it('penalizes extra words by half', () => {
    expect(score('a b', 'a um b')).toBe(80);
  });
  it('gives 0 when nothing was said', () => {
    expect(score('a b', '')).toBe(0);
  });
  it('gives 0 for empty results', () => {
    expect(scoreAttempt([])).toBe(0);
  });
  it('gives 0 when only extra words exist', () => {
    expect(scoreAttempt([{ kind: 'extra', spoken: 'um' }])).toBe(0);
  });
});
