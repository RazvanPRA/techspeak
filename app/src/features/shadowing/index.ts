// Public API of the shadowing feature. Other modules import only from here.
export { ShadowingNavigator } from './navigation/ShadowingNavigator';
export type { ShadowingStackParamList } from './navigation/types';
export {
  ShadowingDependenciesProvider,
  type ShadowingDependencies,
} from './dependencies/ShadowingDependencies';
export { shadowingReducer, type ShadowingState } from './state/slice';
export type { AttemptRepository } from './repository/AttemptRepository';
export { InMemoryAttemptRepository } from './repository/InMemoryAttemptRepository';
export type { AttemptRecord } from './model/types';
