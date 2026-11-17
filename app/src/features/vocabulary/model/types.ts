import type { z } from 'zod';
import type { DeckSchema, TermSchema } from './schemas';

export type Term = z.infer<typeof TermSchema>;
export type Deck = z.infer<typeof DeckSchema>;
export type DeckId = Deck['id'];
export type DeckSummary = Pick<Deck, 'id' | 'title'> & { sentenceCount: number };
