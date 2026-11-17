import { defaultAliases } from '../aliases';
import { normalizeTranscript } from '../normalizeTranscript.service';

describe('normalizeTranscript', () => {
  it('lowercases and strips punctuation', () => {
    expect(normalizeTranscript('Hello, World!')).toEqual(['hello', 'world']);
  });
  it('maps single-word aliases', () => {
    expect(normalizeTranscript('Write a sequel query', defaultAliases)).toEqual(['write', 'a', 'sql', 'query']);
  });
  it('maps multi-word aliases', () => {
    expect(normalizeTranscript('We use Post gress and Jason', defaultAliases)).toEqual(['we', 'use', 'postgres', 'and', 'json']);
  });
  it('prefers the longest alias', () => {
    expect(normalizeTranscript('my sequel', defaultAliases)).toEqual(['mysql']);
  });
  it('does not replace inside other words', () => {
    expect(normalizeTranscript('sequels', defaultAliases)).toEqual(['sequels']);
  });
  it('returns [] for empty or whitespace-only text', () => {
    expect(normalizeTranscript('')).toEqual([]);
    expect(normalizeTranscript('  \n ')).toEqual([]);
  });
  it('ignores aliases with empty keys', () => {
    expect(normalizeTranscript('a b', { '': 'x', '!!': 'y' })).toEqual(['a', 'b']);
  });
});
