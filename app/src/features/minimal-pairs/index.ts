// Public API of the minimal-pairs feature. Other modules import only from here.
export { MinimalPairsNavigator } from './navigation/MinimalPairsNavigator';
export type { MinimalPairsStackParamList } from './navigation/types';
export {
  MinimalPairsDependenciesProvider,
  type MinimalPairsDependencies,
} from './dependencies/MinimalPairsDependencies';
export type { PairRepository } from './repository/PairRepository';
export { SeedPairRepository } from './repository/SeedPairRepository';
export type { PairAttemptRepository } from './repository/PairAttemptRepository';
export { InMemoryPairAttemptRepository } from './repository/InMemoryPairAttemptRepository';
export { SqlitePairAttemptRepository } from './repository/SqlitePairAttemptRepository';
export type { PairAttempt, Sound } from './model/types';
