import type { SyncBatch, SyncChanges } from '../model/types';

/** The server side of sync. */
export interface SyncRepository {
  /** Idempotent: sending the same rows twice changes nothing on the server. */
  push(batch: SyncBatch): Promise<void>;
  /** Rows stored after `cursor` (null = everything), one page. */
  pull(cursor: string | null): Promise<SyncChanges>;
}

/** No server configured (release builds for now): sync is turned off, practice is not affected. */
export class SyncUnavailableError extends Error {
  constructor() {
    super('No TechSpeak server is configured');
    this.name = 'SyncUnavailableError';
  }
}
