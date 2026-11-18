import { createDependencyContext } from '@/shared/utils';
import type { SyncStatusStore } from '../services/SyncStatusStore';

/** Everything the sync feature needs, injected from src/app/dependencies.ts. */
export type SyncDependencies = {
  /** One store for the app, so the launch sync and Settings show the same state. */
  status: SyncStatusStore;
  clock: () => Date;
};

const context = createDependencyContext<SyncDependencies>('Sync');

export const SyncDependenciesProvider = context.Provider;
export const useSyncDependencies = context.useDependencies;
