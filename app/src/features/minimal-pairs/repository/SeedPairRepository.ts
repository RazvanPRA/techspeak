import { MinimalPairsSeedSchema } from '../model/schemas';
import type { MinimalPair } from '../model/types';
import type { PairRepository } from './PairRepository';

export class SeedPairRepository implements PairRepository {
  private readonly pairs: readonly MinimalPair[];

  constructor(seed: unknown) {
    this.pairs = MinimalPairsSeedSchema.parse(seed);
  }

  list(): readonly MinimalPair[] {
    return this.pairs;
  }
}
