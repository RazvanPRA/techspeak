import { rankWeakWords } from '../services/rankWeakWords.service';
import { deckTerm, makeState } from '../testing/fixtures';

const terms = ['query', 'index', 'column', 'foreign key'].map(t => deckTerm('sql', t));
const names = (cards: Array<{ term: { term: string } }>) => cards.map(c => c.term.term);
const none = new Map<string, number>();

describe('rankWeakWords', () => {
  it('ranks by lapses, then by low ease', () => {
    const states = [
      makeState('sql', 'query', { lapses: 1, ease: 2.2 }),
      makeState('sql', 'index', { lapses: 3, ease: 1.8 }),
      makeState('sql', 'column', { lapses: 0, ease: 2.36 }),
    ];
    const ranked = rankWeakWords({ terms, states, missedWords: none, limit: 10 });
    expect(names(ranked)).toEqual(['index', 'query', 'column']);
  });

  it('adds terms missed in shadowing, even if never reviewed', () => {
    const missed = new Map([['column', 2]]);
    const ranked = rankWeakWords({ terms, states: [], missedWords: missed, limit: 10 });
    expect(names(ranked)).toEqual(['column']);
    expect(ranked[0]?.state).toBeNull();
  });

  it('counts a multi-word term only when all its words were missed', () => {
    const onlyKey = new Map([['key', 4]]);
    expect(rankWeakWords({ terms, states: [], missedWords: onlyKey, limit: 10 })).toEqual([]);
    const both = new Map([['foreign', 2], ['key', 4]]);
    expect(names(rankWeakWords({ terms, states: [], missedWords: both, limit: 10 }))).toEqual([
      'foreign key',
    ]);
  });

  it('leaves out healthy terms and respects the limit', () => {
    const states = [
      makeState('sql', 'query', { lapses: 2 }),
      makeState('sql', 'index', { lapses: 1 }),
      makeState('sql', 'column', { ease: 2.6 }),
    ];
    const ranked = rankWeakWords({ terms, states, missedWords: none, limit: 1 });
    expect(names(ranked)).toEqual(['query']);
  });

  it('returns nothing when there is no history', () => {
    expect(rankWeakWords({ terms, states: [], missedWords: none, limit: 10 })).toEqual([]);
  });
});
