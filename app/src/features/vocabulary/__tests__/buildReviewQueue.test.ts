import { buildReviewQueue } from '../services/buildReviewQueue.service';
import { deckTerm, makeState } from '../testing/fixtures';

const now = new Date('2026-11-17T10:00:00.000Z');
const limits = { maxCards: 20, maxNewCards: 10 };
const names = (cards: Array<{ term: { term: string } }>) => cards.map(c => c.term.term);

describe('buildReviewQueue', () => {
  const terms = ['query', 'index', 'column', 'join'].map(t => deckTerm('sql', t));

  it('puts due cards first, most overdue first, then new terms', () => {
    const states = [
      makeState('sql', 'index', { dueAt: '2026-11-17T09:00:00.000Z' }),
      makeState('sql', 'query', { dueAt: '2026-11-10T09:00:00.000Z' }),
    ];
    const queue = buildReviewQueue(terms, states, { now, limits });
    expect(names(queue)).toEqual(['query', 'index', 'column', 'join']);
    expect(queue[2]?.state).toBeNull();
  });

  it('leaves out cards that are not due yet', () => {
    const states = [makeState('sql', 'query', { dueAt: '2026-11-18T10:00:00.000Z' })];
    expect(names(buildReviewQueue(terms, states, { now, limits }))).not.toContain('query');
  });

  it('counts a card due exactly now as due', () => {
    const states = [makeState('sql', 'query', { dueAt: now.toISOString() })];
    expect(names(buildReviewQueue(terms, states, { now, limits }))[0]).toBe('query');
  });

  it('caps new cards and the total', () => {
    const queue = buildReviewQueue(terms, [makeState('sql', 'join')], {
      now,
      limits: { maxCards: 2, maxNewCards: 1 },
    });
    expect(names(queue)).toEqual(['join', 'query']);
  });

  it('keeps the same term in different decks apart', () => {
    const both = [deckTerm('sql', 'index'), deckTerm('nosql-mongodb', 'index')];
    const states = [makeState('sql', 'index', { dueAt: '2026-12-01T00:00:00.000Z' })];
    const queue = buildReviewQueue(both, states, { now, limits });
    expect(queue.map(c => c.deckId)).toEqual(['nosql-mongodb']);
  });

  it('ignores stored states for terms that are no longer in the decks', () => {
    const states = [makeState('sql', 'removed-term')];
    expect(buildReviewQueue([], states, { now, limits })).toEqual([]);
  });
});
