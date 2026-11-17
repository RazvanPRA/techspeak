import type { AttemptRecord } from '../model/types';

/** Every attempt is stored (SPEC 3.1). op-sqlite implementation arrives in milestone 2. */
export interface AttemptRepository {
  save(record: AttemptRecord): Promise<void>;
  listByDeck(deckId: string): Promise<AttemptRecord[]>;
}
