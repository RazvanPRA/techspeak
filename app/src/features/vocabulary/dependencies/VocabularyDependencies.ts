import type { AliasMap } from '@/services/scoring';
import type { RecognizerRepository, RecorderRepository, TtsRepository } from '@/services/speech';
import { createDependencyContext } from '@/shared/utils';
import type { DeckRepository } from '../repository/DeckRepository';
import type { VocabularyRepository } from '../repository/VocabularyRepository';

/** Everything the vocabulary feature needs, injected from src/app/dependencies.ts. */
export type VocabularyDependencies = {
  decks: DeckRepository;
  reviews: VocabularyRepository;
  tts: TtsRepository;
  recorder: RecorderRepository;
  recognizer: RecognizerRepository;
  aliases: AliasMap;
  /** Normalized word → how often it was missed elsewhere (shadowing), for the weak-words deck. */
  missedWords: () => Promise<ReadonlyMap<string, number>>;
  clock: () => Date;
};

const context = createDependencyContext<VocabularyDependencies>('Vocabulary');

export const VocabularyDependenciesProvider = context.Provider;
export const useVocabularyDependencies = context.useDependencies;
