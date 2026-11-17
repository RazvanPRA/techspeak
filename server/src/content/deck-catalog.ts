import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { type Deck, DeckSchema } from './deck.schema.js';

/** The learning decks, loaded once at startup from the generated JSON seeds. */
export class DeckCatalog {
  private readonly byId: ReadonlyMap<string, Deck>;

  constructor(decks: readonly Deck[]) {
    this.byId = new Map(decks.map((d) => [d.id, d]));
  }

  static fromJson(raw: readonly unknown[]): DeckCatalog {
    return new DeckCatalog(raw.map((d) => DeckSchema.parse(d)));
  }

  static fromDirectory(dir: string): DeckCatalog {
    const files = readdirSync(dir).filter((f) => f.endsWith('.json'));
    return DeckCatalog.fromJson(
      files.map((f) => JSON.parse(readFileSync(join(dir, f), 'utf8'))),
    );
  }

  get(id: string): Deck | undefined {
    return this.byId.get(id);
  }

  ids(): string[] {
    return [...this.byId.keys()];
  }
}
