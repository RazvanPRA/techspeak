import type { AttemptRecord } from '../model/types';
import type { AttemptRepository } from './AttemptRepository';

export class InMemoryAttemptRepository implements AttemptRepository {
  private readonly records: AttemptRecord[] = [];

  async save(record: AttemptRecord): Promise<void> {
    this.records.push(record);
  }

  async listByDeck(deckId: string): Promise<AttemptRecord[]> {
    return this.records.filter(r => r.deckId === deckId);
  }
}
