import type { HttpClient } from '@/services/api';
import { SyncChangesSchema, SyncUploadResultSchema } from '../model/schemas';
import type { SyncBatch, SyncChanges } from '../model/types';
import { type SyncRepository, SyncUnavailableError } from './SyncRepository';

/** POST /sync and GET /sync on my own TechSpeak server. */
export class RemoteSyncRepository implements SyncRepository {
  constructor(private readonly http: HttpClient) {}

  async push(batch: SyncBatch): Promise<void> {
    await this.http.postJson('/sync', batch, SyncUploadResultSchema);
  }

  pull(cursor: string | null): Promise<SyncChanges> {
    const query = cursor ? `?since=${encodeURIComponent(cursor)}` : '';
    return this.http.getJson(`/sync${query}`, SyncChangesSchema);
  }
}

export class UnavailableSyncRepository implements SyncRepository {
  async push(): Promise<void> {
    throw new SyncUnavailableError();
  }
  async pull(): Promise<SyncChanges> {
    throw new SyncUnavailableError();
  }
}
