import type { AttemptRecord } from '../model/types';

/** Every attempt is stored (SPEC 3.1). */
export interface AttemptRepository {
  save(record: AttemptRecord): Promise<void>;
  listByDeck(deckId: string): Promise<AttemptRecord[]>;
  /** Newest first. */
  listRecent(limit: number): Promise<AttemptRecord[]>;
}
