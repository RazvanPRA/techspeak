import type { PairAttempt } from '../model/types';
import type { PairAttemptRepository } from './PairAttemptRepository';

export class InMemoryPairAttemptRepository implements PairAttemptRepository {
  private readonly attempts: PairAttempt[] = [];

  async save(attempt: PairAttempt): Promise<void> {
    this.attempts.push(attempt);
  }

  async listRecent(limit: number): Promise<PairAttempt[]> {
    return [...this.attempts].reverse().slice(0, limit);
  }
}
