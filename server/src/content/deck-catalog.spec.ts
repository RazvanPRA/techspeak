import { join } from 'node:path';
import { DeckCatalog } from './deck-catalog.js';

describe('DeckCatalog', () => {
  it('loads and validates every generated deck', () => {
    const catalog = DeckCatalog.fromDirectory(
      join(import.meta.dirname, 'decks'),
    );
    expect(catalog.ids()).toContain('react-rn');
    expect(catalog.ids()).toHaveLength(13);
    expect(catalog.get('sql')?.title).toBe('SQL & relational databases');
  });

  it('returns undefined for an unknown deck', () => {
    expect(new DeckCatalog([]).get('nope')).toBeUndefined();
  });

  it('rejects an invalid deck', () => {
    expect(() =>
      DeckCatalog.fromJson([
        { id: 'Bad Id', title: '', terms: [], sentences: [] },
      ]),
    ).toThrow();
  });
});
