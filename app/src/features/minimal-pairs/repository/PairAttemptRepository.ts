import type { PairAttempt } from '../model/types';

/** Every listen-and-pick and say-it result (feeds "weakest sounds" in milestone 4). */
export interface PairAttemptRepository {
  save(attempt: PairAttempt): Promise<void>;
  /** Newest first. */
  listRecent(limit: number): Promise<PairAttempt[]>;
}
