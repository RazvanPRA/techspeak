import { reviewKey } from '../model/reviewKey';
import type { DeckId, ReviewState } from '../model/types';
import type { VocabularyRepository } from './VocabularyRepository';

export class InMemoryVocabularyRepository implements VocabularyRepository {
  private readonly states = new Map<string, ReviewState>();

  constructor(initial: readonly ReviewState[] = []) {
    initial.forEach(s => this.states.set(reviewKey(s.deckId, s.term), s));
  }

  async listStates(deckIds?: readonly DeckId[]): Promise<ReviewState[]> {
    const all = [...this.states.values()];
    return deckIds ? all.filter(s => deckIds.includes(s.deckId)) : all;
  }

  async saveReview(state: ReviewState): Promise<void> {
    this.states.set(reviewKey(state.deckId, state.term), state);
  }
}
