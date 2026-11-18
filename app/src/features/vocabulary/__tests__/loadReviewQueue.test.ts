import { seedDecks } from '@/content/decks';
import { InMemoryVocabularyRepository } from '../repository/InMemoryVocabularyRepository';
import { SeedDeckRepository } from '../repository/SeedDeckRepository';
import { countReviewCards } from '../services/countReviewCards.service';
import { loadReviewQueue } from '../services/loadReviewQueue.service';
import { makeState } from '../testing/fixtures';

const now = new Date('2026-11-17T10:00:00.000Z');
const decks = new SeedDeckRepository(seedDecks);

function sources(missed: Array<[string, number]> = [], states = [makeState('sql', 'query')]) {
  return {
    decks,
    reviews: new InMemoryVocabularyRepository(states),
    missedWords: async () => new Map(missed),
  };
}

describe('loadReviewQueue', () => {
  it('builds a session from the chosen decks, due cards first', async () => {
    const cards = await loadReviewQueue(sources(), { kind: 'decks', deckIds: ['sql'] }, now);
    expect(cards[0]).toMatchObject({ deckId: 'sql', term: { term: 'query' } });
    expect(cards.length).toBeGreaterThan(1);
    expect(cards.length).toBeLessThanOrEqual(20);
    expect(cards.every(c => c.deckId === 'sql')).toBe(true);
  });

  it('is empty when no deck is chosen', async () => {
    expect(await loadReviewQueue(sources(), { kind: 'decks', deckIds: [] }, now)).toEqual([]);
  });

  it('builds the weak-words deck from lapses and shadowing misses across all decks', async () => {
    const weak = [makeState('go', 'goroutine', { lapses: 2 })];
    const cards = await loadReviewQueue(sources([['column', 3]], weak), { kind: 'weak' }, now);
    expect(cards.map(c => c.term.term)).toEqual(['column', 'goroutine']);
  });
});

describe('countReviewCards', () => {
  it('counts the cards a review of every deck would show, within the session cap', async () => {
    const count = await countReviewCards(sources(), now);
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThanOrEqual(20);
  });

  it('is 0 when every term is reviewed and none is due', async () => {
    const sql = decks.getDeck('sql');
    if (!sql) throw new Error('The sql deck is missing');
    const one = new SeedDeckRepository([sql]);
    const states = sql.terms.map(t => makeState('sql', t.term, { dueAt: '2027-01-01T00:00:00.000Z' }));
    const reviews = new InMemoryVocabularyRepository(states);
    expect(await countReviewCards({ decks: one, reviews }, now)).toBe(0);
  });
});
