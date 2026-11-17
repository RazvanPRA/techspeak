import { testDeck } from '../testing/deck-fixture.js';
import { matchDeckTerms } from './match-deck-terms.js';
import { pickPhrasesToReuse } from './pick-phrases-to-reuse.js';

describe('matchDeckTerms', () => {
  it('finds terms used, across word breaks, spoken aliases and plurals', () => {
    const result = matchDeckTerms(
      testDeck,
      'An index helps the query. Post gress Q L handles transactions.',
      'Explain ACID.',
    );
    expect(result.used).toEqual([
      'query',
      'index',
      'transaction',
      'PostgreSQL',
    ]);
  });

  it('does not count a longer word as the term', () => {
    expect(matchDeckTerms(testDeck, 'We reindexed it.', '').used).toEqual([]);
  });

  it('accepts any written alternative of a term', () => {
    expect(matchDeckTerms(testDeck, 'We use SSG here.', '').used).toEqual([
      'SSR / SSG',
    ]);
  });

  it('lists missing terms mentioned in the prompt first, at most five', () => {
    const result = matchDeckTerms(
      testDeck,
      'nothing relevant',
      'Explain ACID and isolation levels.',
    );
    expect(result.missing).toEqual([
      'isolation level',
      'ACID',
      'query',
      'index',
      'transaction',
    ]);
  });

  it('has no missing terms when every term was used', () => {
    const all = 'query index transaction isolation level acid postgresql ssr';
    expect(matchDeckTerms(testDeck, all, '').missing).toEqual([]);
  });
});

describe('pickPhrasesToReuse', () => {
  it('prefers sentences that contain missing terms, then prompt words', () => {
    const phrases = pickPhrasesToReuse(
      testDeck,
      'How would you investigate a slow query?',
      ['transaction'],
    );
    expect(phrases).toEqual([
      'Wrap both updates in a transaction so they succeed or fail together.',
      'Use EXPLAIN ANALYZE to see why the query is slow.',
      'Add an index on the foreign key so the join stops scanning the whole table.',
    ]);
  });

  it('returns at most three, and fewer when the deck has fewer', () => {
    expect(pickPhrasesToReuse(testDeck, '', [])).toHaveLength(3);
    const tiny = { ...testDeck, sentences: ['Only one sentence.'] };
    expect(pickPhrasesToReuse(tiny, '', [])).toEqual(['Only one sentence.']);
  });

  it('also offers term examples (decks without shadowing sentences)', () => {
    const deck = {
      ...testDeck,
      sentences: ['A plain sentence.'],
      terms: [
        { ...testDeck.terms[0]!, example: 'Let me circle back on that query.' },
      ],
    };
    expect(pickPhrasesToReuse(deck, '', ['query'])[0]).toBe(
      'Let me circle back on that query.',
    );
  });
});
