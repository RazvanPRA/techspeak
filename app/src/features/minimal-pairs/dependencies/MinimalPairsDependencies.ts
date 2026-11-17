import type { AliasMap } from '@/services/scoring';
import type {
  PronunciationAssessor,
  RecognizerRepository,
  RecorderRepository,
  TtsRepository,
} from '@/services/speech';
import { createDependencyContext } from '@/shared/utils';
import type { PairAttemptRepository } from '../repository/PairAttemptRepository';
import type { PairRepository } from '../repository/PairRepository';

/** Everything the minimal-pairs feature needs, injected from src/app/dependencies.ts. */
export type MinimalPairsDependencies = {
  pairs: PairRepository;
  attempts: PairAttemptRepository;
  tts: TtsRepository;
  recorder: RecorderRepository;
  recognizer: RecognizerRepository;
  /** Say-it scoring: Azure (phoneme accuracy) with an on-device fallback. */
  assessor: PronunciationAssessor;
  aliases: AliasMap;
  clock: () => Date;
  /** [0, 1) like Math.random; injected so rounds are reproducible in tests. */
  random: () => number;
};

const context = createDependencyContext<MinimalPairsDependencies>('MinimalPairs');

export const MinimalPairsDependenciesProvider = context.Provider;
export const useMinimalPairsDependencies = context.useDependencies;
