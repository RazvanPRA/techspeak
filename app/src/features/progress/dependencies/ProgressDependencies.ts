import { createDependencyContext } from '@/shared/utils';
import type { ProgressSources } from '../model/sources';

/** Everything the progress feature needs, injected from src/app/dependencies.ts. */
export type ProgressDependencies = ProgressSources;

const context = createDependencyContext<ProgressDependencies>('Progress');

export const ProgressDependenciesProvider = context.Provider;
export const useProgressDependencies = context.useDependencies;
