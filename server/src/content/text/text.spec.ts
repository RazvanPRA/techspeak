import { containsPhrase } from './contains-phrase.js';
import { normalizeText, normalizeWord } from './normalize-text.js';
import { spokenForms } from './spoken-forms.js';

describe('normalizeWord', () => {
  it.each([
    ['Node.js', 'nodejs'],
    ['useEffect,', 'useeffect'],
    ["Let's", "let's"],
    ['’quoted’', 'quoted'],
    ['—', ''],
  ])('%s → %s', (input, expected) => {
    expect(normalizeWord(input)).toBe(expected);
  });
});

describe('normalizeText', () => {
  it('splits, normalizes and maps spoken aliases (longest first)', () => {
    expect(normalizeText('I use My Sequel and sequel, basically.')).toEqual([
      'i',
      'use',
      'mysql',
      'and',
      'sql',
      'basically',
    ]);
  });

  it('returns no words for blank text', () => {
    expect(normalizeText('  \n ')).toEqual([]);
  });
});

describe('containsPhrase', () => {
  it('matches across word breaks', () => {
    expect(
      containsPhrase(['call', 'use', 'effect', 'here'], ['useeffect']),
    ).toBe(true);
    expect(containsPhrase(['useeffect'], ['use', 'effect'])).toBe(true);
  });

  it('does not match a partial word', () => {
    expect(containsPhrase(['rendering'], ['render'])).toBe(false);
  });

  it('never matches an empty phrase', () => {
    expect(containsPhrase(['a'], [])).toBe(false);
  });
});

describe('spokenForms', () => {
  it('splits written alternatives and parentheses', () => {
    expect(spokenForms('SSR / SSG')).toEqual(['SSR', 'SSG']);
    expect(spokenForms('write-ahead log (WAL)')).toEqual([
      'write-ahead log',
      'WAL',
    ]);
    expect(spokenForms('render')).toEqual(['render']);
  });
});
