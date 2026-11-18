import type { DeckRepository } from '@/features/vocabulary';
import type {
  PlayerRepository,
  PronunciationAssessor,
  RecognizerRepository,
  RecorderRepository,
  TtsRepository,
} from '@/services/speech';
import { createDependencyContext } from '@/shared/utils';
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

const context = createDependencyContext<ShadowingDependencies>('Shadowing');

export const ShadowingDependenciesProvider = context.Provider;
export const useShadowingDependencies = context.useDependencies;
