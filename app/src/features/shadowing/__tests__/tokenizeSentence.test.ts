import { seedDecks } from '@/content/decks';
import { SeedDeckRepository } from '@/features/vocabulary';
import { targetTermNames, tokenizeSentence } from '../services/tokenizeSentence.service';
import { extraWords, mapTokenStatuses } from '../services/mapTokenStatuses.service';

const decks = new SeedDeckRepository(seedDecks);
const sql = decks.getDeck('sql');

describe('tokenizeSentence', () => {
  it('keeps punctuation for display and normalizes for comparison', () => {
    const tokens = tokenizeSentence('Hello, Postgres!', sql?.terms ?? []);
    expect(tokens.map(t => [t.text, t.normalized])).toEqual([
      ['Hello,', 'hello'],
      ['Postgres!', 'postgres'],
    ]);
  });

  it('drops tokens without letters or digits', () => {
    expect(tokenizeSentence('a — b', []).map(t => t.text)).toEqual(['a', 'b']);
  });

  it('returns [] for an empty sentence', () => {
    expect(tokenizeSentence('   ', [])).toEqual([]);
  });

  it('lists unique target term names', () => {
    const tokens = tokenizeSentence('SQL and SQL', sql?.terms ?? []);
    expect(targetTermNames(tokens)).toEqual(['SQL']);
  });
});

describe('every shadowing sentence has at least one target word', () => {
  const cases = decks.listDecks().flatMap(summary => {
    const deck = decks.getDeck(summary.id);
    return (deck?.sentences ?? []).map(s => [summary.id, s, deck?.terms ?? []] as const);
  });
  it.each(cases)('%s: %s', (_, sentence, terms) => {
    const tokens = tokenizeSentence(sentence, terms);
    expect(tokens.some(t => t.term !== null)).toBe(true);
  });
});

describe('mapTokenStatuses', () => {
  it('maps results by target index and ignores extras', () => {
    const statuses = mapTokenStatuses(3, [
      { kind: 'ok', targetIndex: 0, word: 'a' },
      { kind: 'extra', spoken: 'um' },
      { kind: 'wrong', targetIndex: 1, word: 'b', spoken: 'x' },
      { kind: 'missing', targetIndex: 2, word: 'c' },
    ]);
    expect(statuses).toEqual(['ok', 'wrong', 'missing']);
  });
  it('returns pending without results', () => {
    expect(mapTokenStatuses(2, null)).toEqual(['pending', 'pending']);
  });
  it('ignores out-of-range indexes', () => {
    expect(mapTokenStatuses(1, [{ kind: 'ok', targetIndex: 5, word: 'z' }])).toEqual(['pending']);
  });
  it('lists extra words', () => {
    expect(extraWords([{ kind: 'extra', spoken: 'um' }, { kind: 'ok', targetIndex: 0, word: 'a' }])).toEqual(['um']);
    expect(extraWords(null)).toEqual([]);
  });
});
