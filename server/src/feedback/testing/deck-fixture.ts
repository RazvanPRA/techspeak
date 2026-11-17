import type { Deck, Term } from '../../content/deck.schema.js';

export const term = (value: string, extra: Partial<Term> = {}): Term => ({
  term: value,
  ipa: null,
  spelled: false,
  hint: null,
  meaning: null,
  example: null,
  ...extra,
});

/** A small deck for feedback tests. */
export const testDeck: Deck = {
  id: 'sql',
  title: 'SQL & relational databases',
  terms: [
    term('query', { ipa: '/ˈkwɪəri/', hint: '"KWEER-ee"' }),
    term('index', { ipa: '/ˈɪndɛks/' }),
    term('transaction', { ipa: '/trænˈzækʃən/', hint: 'stress on "-ZAK-"' }),
    term('isolation level'),
    term('ACID', { hint: 'say it as a word: "ASS-id"' }),
    term('PostgreSQL', { ipa: '/ˌpoʊstɡrɛs kjuː ˈɛl/' }),
    term('SSR / SSG'),
  ],
  sentences: [
    'Add an index on the foreign key so the join stops scanning the whole table.',
    'Wrap both updates in a transaction so they succeed or fail together.',
    'The default isolation level in PostgreSQL is read committed.',
    'Use EXPLAIN ANALYZE to see why the query is slow.',
  ],
};
