import type { PronunciationResult } from '../assessment.types.js';

export type AttemptToSave = PronunciationResult & { referenceText: string };

/** Where assessed attempts are kept. */
export interface AttemptStore {
  save(attempt: AttemptToSave): Promise<void>;
}

export const ATTEMPT_STORE = Symbol('AttemptStore');
