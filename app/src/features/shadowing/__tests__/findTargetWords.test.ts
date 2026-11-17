import type { Term } from '@/features/vocabulary';
import { findTargetWords, wordMatches } from '../services/findTargetWords.service';

const term = (name: string): Term => ({
  term: name,
  ipa: null,
  spelled: false,
  hint: null,
  meaning: null,
  example: null,
});

describe('wordMatches', () => {
  it.each([
    ['render', 'render', true],
    ['render', 'renders', true],
    ['roll', 'rolled', true],
    ['cache', 'caching', true],
    ['query', 'queries', true],
    ['index', 'indexes', true],
    ['index', 'independent', false],
    ['go', 'goes', false],
    ['bundle', 'bundled', true],
    ['render', 'rerenders', true],
    ['memoization', 'memoize', true],
    ['inference', 'infer', true],
    ['generics', 'general', false],
    ['redis', 'red', false],
  ])('%s ~ %s → %s', (t, w, expected) => {
    expect(wordMatches(t, w)).toBe(expected);
  });
});

describe('findTargetWords', () => {
  const words = ['we', 'rolled', 'back', 'the', 'sql', 'migration'];

  it('marks multi-word terms', () => {
    const result = findTargetWords(words, [term('roll back')]);
    expect(result.map(r => r?.term ?? null)).toEqual([null, 'roll back', 'roll back', null, null, null]);
  });

  it('supports "a / b" variants', () => {
    const result = findTargetWords(['tear', 'it', 'down'], [term('spin up / tear down')]);
    expect(result.every(r => r === null)).toBe(true);
    const ok = findTargetWords(['tear', 'down', 'now'], [term('spin up / tear down')]);
    expect(ok.map(r => r !== null)).toEqual([true, true, false]);
  });

  it('lets longer terms win over shorter overlapping ones', () => {
    const result = findTargetWords(['prop', 'drilling'], [term('prop'), term('prop drilling')]);
    expect(result.map(r => r?.term)).toEqual(['prop drilling', 'prop drilling']);
  });

  it('falls back to single long words of a multi-word term', () => {
    const result = findTargetWords(['invalidates', 'the', 'cache'], [term('cache invalidation')]);
    expect(result.map(r => r !== null)).toEqual([true, false, true]);
  });

  it('matches spelled acronyms and punctuated names', () => {
    const result = findTargetWords(words, [term('SQL'), term('Node.js')]);
    expect(result[4]?.term).toBe('SQL');
  });

  it('returns all null for no terms or no words', () => {
    expect(findTargetWords(words, [])).toEqual(words.map(() => null));
    expect(findTargetWords([], [term('sql')])).toEqual([]);
  });
});
