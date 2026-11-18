import type { DeckRepository } from '@/features/vocabulary';
import type { RecognizerRepository, RecorderRepository } from '@/services/speech';
import { createDependencyContext } from '@/shared/utils';
import type { FeedbackRepository } from '../repository/FeedbackRepository';
import type { PromptRepository } from '../repository/PromptRepository';

/** Everything the scenarios feature needs, injected from src/app/dependencies.ts. */
export type ScenariosDependencies = {
  prompts: PromptRepository;
  feedback: FeedbackRepository;
  /** Deck terms become Whisper hints for the answer. */
  decks: DeckRepository;
  recorder: RecorderRepository;
  recognizer: RecognizerRepository;
  clock: () => Date;
};

const context = createDependencyContext<ScenariosDependencies>('Scenarios');

export const ScenariosDependenciesProvider = context.Provider;
export const useScenariosDependencies = context.useDependencies;
