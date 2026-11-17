import { defaultAliases } from '@/services/scoring';
import { isTermRecognised } from '../services/isTermRecognised.service';

const check = (term: string, transcript: string) =>
  isTermRecognised(term, transcript, defaultAliases);

describe('isTermRecognised', () => {
  it('accepts the term on its own or inside a sentence', () => {
    expect(check('query', 'Query.')).toBe(true);
    expect(check('query', 'I think it was query')).toBe(true);
  });

  it('accepts camelCase terms said as two words', () => {
    expect(check('useEffect', 'use effect')).toBe(true);
  });

  it('accepts multi-word and hyphenated terms', () => {
    expect(check('foreign key', 'foreign key')).toBe(true);
    expect(check('write-ahead log (WAL)', 'write ahead log')).toBe(true);
  });

  it('accepts any written alternative', () => {
    expect(check('SSR / SSG / ISR', 'SSG')).toBe(true);
    expect(check('write-ahead log (WAL)', 'wal')).toBe(true);
  });

  it('maps spoken aliases', () => {
    expect(check('SQL', 'sequel')).toBe(true);
  });

  it('rejects a different word or silence', () => {
    expect(check('query', 'curry')).toBe(false);
    expect(check('query', '')).toBe(false);
  });
});
