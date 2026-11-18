import type { DeckRepository } from '@/features/vocabulary';
import type {
  PlayerRepository,
  RecognizerRepository,
  RecorderRepository,
  RecordingArchive,
} from '@/services/speech';
import { createDependencyContext } from '@/shared/utils';
import type { FeedbackRepository } from '../repository/FeedbackRepository';
import type { PromptRepository } from '../repository/PromptRepository';
import type { ScenarioAnswerRepository } from '../repository/ScenarioAnswerRepository';
import type { TalkRepository } from '../repository/TalkRepository';

/** Everything the scenarios feature needs, injected from src/app/dependencies.ts. */
export type ScenariosDependencies = {
  prompts: PromptRepository;
  feedback: FeedbackRepository;
  /** Deck terms become Whisper hints for the answer. */
  decks: DeckRepository;
  /** Every answer is kept on the device for the progress trends. */
  answers: ScenarioAnswerRepository;
  talks: TalkRepository;
  archive: RecordingArchive;
  recorder: RecorderRepository;
  recognizer: RecognizerRepository;
  player: PlayerRepository;
  clock: () => Date;
  /** [0, 1) like Math.random; picks the mock-interview questions. */
  random: () => number;
};

const context = createDependencyContext<ScenariosDependencies>('Scenarios');

export const ScenariosDependenciesProvider = context.Provider;
export const useScenariosDependencies = context.useDependencies;
