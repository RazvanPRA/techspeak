import { containsPhrase } from '../containsPhrase.service';

describe('containsPhrase', () => {
  it('finds a single word', () => {
    expect(containsPhrase(['the', 'query', 'is', 'slow'], ['query'])).toBe(true);
  });

  it('finds a multi-word phrase', () => {
    expect(containsPhrase(['add', 'a', 'foreign', 'key'], ['foreign', 'key'])).toBe(true);
  });

  it('ignores word breaks in either direction', () => {
    expect(containsPhrase(['use', 'effect'], ['useeffect'])).toBe(true);
    expect(containsPhrase(['postgres'], ['post', 'gres'])).toBe(true);
  });

  it('does not match part of a longer word', () => {
    expect(containsPhrase(['mysql'], ['sql'])).toBe(false);
    expect(containsPhrase(['sinking'], ['sink'])).toBe(false);
  });

  it('does not match words that are not adjacent', () => {
    expect(containsPhrase(['foreign', 'big', 'key'], ['foreign', 'key'])).toBe(false);
  });

  it('is false for an empty phrase or empty speech', () => {
    expect(containsPhrase(['query'], [])).toBe(false);
    expect(containsPhrase([], ['query'])).toBe(false);
  });
});
