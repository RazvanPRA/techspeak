import { DeckSchema } from '../model/schemas';
import type { Deck, DeckId, DeckSummary } from '../model/types';
import type { DeckRepository } from './DeckRepository';

export class SeedDeckRepository implements DeckRepository {
  private readonly decks: ReadonlyMap<DeckId, Deck>;

  constructor(seeds: unknown[]) {
    const parsed = seeds.map(seed => DeckSchema.parse(seed));
    this.decks = new Map(parsed.map(deck => [deck.id, deck]));
  }

  listDecks(): DeckSummary[] {
    return [...this.decks.values()].map(({ id, title, sentences }) => ({
      id,
      title,
      sentenceCount: sentences.length,
    }));
  }

  getDeck(id: DeckId): Deck | undefined {
    return this.decks.get(id);
  }
}
