import type { MinimalPair } from '../model/types';

/** The minimal-pair content (generated from VOCABULARY.md). */
export interface PairRepository {
  list(): readonly MinimalPair[];
}
