// Public API of the vocabulary feature. Other modules import only from here.
export { VocabularyNavigator } from './navigation/VocabularyNavigator';
export type { VocabularyStackParamList } from './navigation/types';
export {
  VocabularyDependenciesProvider,
  type VocabularyDependencies,
} from './dependencies/VocabularyDependencies';
export { vocabularyReducer, type VocabularyState } from './state/slice';
export type { DeckRepository } from './repository/DeckRepository';
export { SeedDeckRepository } from './repository/SeedDeckRepository';
export type { VocabularyRepository } from './repository/VocabularyRepository';
export { InMemoryVocabularyRepository } from './repository/InMemoryVocabularyRepository';
export { SqliteVocabularyRepository } from './repository/SqliteVocabularyRepository';
export type { Deck, DeckId, DeckSummary, ReviewState, Term } from './model/types';
