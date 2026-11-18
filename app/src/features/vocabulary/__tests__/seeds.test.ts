import { seedDecks } from '@/content/decks';
import { DeckSchema } from '../model/schemas';
import { SeedDeckRepository } from '../repository/SeedDeckRepository';

describe('deck seeds', () => {
  it('contains all 13 decks', () => {
    expect(seedDecks).toHaveLength(13);
  });

  it.each(seedDecks.map((d, i) => [i, d]))('seed %i passes DeckSchema', (_, seed) => {
    expect(() => DeckSchema.parse(seed)).not.toThrow();
  });

  it('has unique deck ids', () => {
    const ids = new SeedDeckRepository(seedDecks).listDecks().map(d => d.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('SeedDeckRepository', () => {
  const repo = new SeedDeckRepository(seedDecks);

  it('returns a deck by id', () => {
    expect(repo.getDeck('sql')?.title).toContain('SQL');
  });
  it('returns undefined for an unknown id', () => {
    expect(repo.getDeck('nope')).toBeUndefined();
  });
  it('rejects an invalid seed', () => {
    expect(() => new SeedDeckRepository([{ id: 'Bad Id' }])).toThrow();
  });
});
