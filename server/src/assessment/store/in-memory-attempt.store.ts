import type { AttemptStore, AttemptToSave } from './attempt-store.js';

/** Test double: keeps attempts in an array. */
export class InMemoryAttemptStore implements AttemptStore {
  readonly saved: AttemptToSave[] = [];

  async save(attempt: AttemptToSave): Promise<void> {
    this.saved.push(attempt);
  }
}
