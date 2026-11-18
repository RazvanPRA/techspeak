import React, { type ReactNode } from 'react';
import { MinimalPairsDependenciesProvider } from '@/features/minimal-pairs';
import { ProgressDependenciesProvider } from '@/features/progress';
import { ScenariosDependenciesProvider } from '@/features/scenarios';
import { SessionDependenciesProvider } from '@/features/session';
import { ShadowingDependenciesProvider } from '@/features/shadowing';
import { VocabularyDependenciesProvider } from '@/features/vocabulary';
import type { AppDependencies } from './dependencies';

/** Hands each feature its injected dependencies. */
export function FeatureProviders({ deps, children }: { deps: AppDependencies; children: ReactNode }) {
  return (
    <ShadowingDependenciesProvider value={deps.shadowing}>
      <VocabularyDependenciesProvider value={deps.vocabulary}>
        <MinimalPairsDependenciesProvider value={deps.minimalPairs}>
          <ScenariosDependenciesProvider value={deps.scenarios}>
            <SessionDependenciesProvider value={deps.session}>
              <ProgressDependenciesProvider value={deps.progress}>{children}</ProgressDependenciesProvider>
            </SessionDependenciesProvider>
          </ScenariosDependenciesProvider>
        </MinimalPairsDependenciesProvider>
      </VocabularyDependenciesProvider>
    </ShadowingDependenciesProvider>
  );
}
