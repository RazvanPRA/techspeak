import { ApiError } from '@/services/api';
import { errorMessage } from '@/shared/utils';
import type { SyncMeta, SyncStatus } from '../model/types';
import { SyncUnavailableError } from '../repository/SyncRepository';
import type { SyncResult } from './runSync';

export type SyncState = { status: SyncStatus; lastSyncedAt: string | null; error: string | null };

function classify(error: unknown): Pick<SyncState, 'status' | 'error'> {
  if (error instanceof SyncUnavailableError) return { status: 'unavailable', error: null };
  if (error instanceof ApiError && error.status === 0) return { status: 'offline', error: null };
  return { status: 'error', error: errorMessage(error) };
}

/**
 * One sync state for the whole app (the launch sync and the Settings row show the same thing).
 * `syncNow` never throws: failures become a status, so practice is never blocked.
 */
export class SyncStatusStore {
  private state: SyncState = { status: 'idle', lastSyncedAt: null, error: null };
  private readonly listeners = new Set<() => void>();

  constructor(
    private readonly run: () => Promise<SyncResult>,
    private readonly readMeta: () => Promise<SyncMeta>,
  ) {}

  get = (): SyncState => this.state;

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  /** Loads the last sync time saved on the device. */
  async load(): Promise<void> {
    try {
      const { lastSyncedAt } = await this.readMeta();
      if (this.state.lastSyncedAt === null) this.set({ lastSyncedAt });
    } catch {
      // Not knowing the last sync time is harmless.
    }
  }

  syncNow = async (): Promise<void> => {
    this.set({ status: 'syncing', error: null });
    try {
      const { lastSyncedAt } = await this.run();
      this.set({ status: 'done', lastSyncedAt });
    } catch (error) {
      this.set(classify(error));
    }
  };

  private set(change: Partial<SyncState>): void {
    this.state = { ...this.state, ...change };
    this.listeners.forEach(listener => listener());
  }
}
