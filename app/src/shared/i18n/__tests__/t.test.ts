import { t } from '../t';

describe('t', () => {
  it('returns a nested string', () => {
    expect(t('shadowing.play')).toBe('Play');
  });
  it('interpolates params', () => {
    expect(t('shadowing.score', { score: 90 })).toBe('Score 90');
  });
  it('keeps unknown placeholders', () => {
    expect(t('shadowing.score')).toBe('Score {score}');
  });
});
