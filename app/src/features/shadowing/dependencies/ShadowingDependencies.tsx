import React, { createContext, type ReactNode, useContext } from 'react';
import type { DeckRepository } from '@/features/vocabulary';
import type {
  PlayerRepository,
  PronunciationAssessor,
  RecognizerRepository,
  RecorderRepository,
  TtsRepository,
} from '@/services/speech';
import type { AttemptRepository } from '../repository/AttemptRepository';

/** Everything the shadowing feature needs, injected from src/app/dependencies.ts. */
export type ShadowingDependencies = {
  decks: DeckRepository;
  attempts: AttemptRepository;
  tts: TtsRepository;
  recorder: RecorderRepository;
  player: PlayerRepository;
  recognizer: RecognizerRepository;
  assessor: PronunciationAssessor;
  clock: () => Date;
};

const Context = createContext<ShadowingDependencies | null>(null);

export function ShadowingDependenciesProvider(props: {
  value: ShadowingDependencies;
  children: ReactNode;
}) {
  return <Context.Provider value={props.value}>{props.children}</Context.Provider>;
}

export function useShadowingDependencies(): ShadowingDependencies {
  const value = useContext(Context);
  if (!value) throw new Error('ShadowingDependenciesProvider is missing');
  return value;
}
