import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DeckCatalog } from '../content/deck-catalog.js';
import type { ScenarioFeedback } from './feedback.schema.js';
import {
  FEEDBACK_PROVIDER,
  type FeedbackProvider,
} from './providers/feedback-provider.js';
import type { ScoredWord } from './rules/pronunciation-tips.js';
import {
  SCENARIO_ANSWER_STORE,
  type ScenarioAnswerStore,
} from './store/scenario-answer-store.js';

export type FeedbackRequest = {
  prompt: string;
  deckId: string;
  transcript: string;
  durationSeconds: number;
  pronunciation?: ScoredWord[];
};

/** Look up the deck → ask the provider → keep the answer and its feedback. */
@Injectable()
export class FeedbackService {
  constructor(
    private readonly decks: DeckCatalog,
    @Inject(FEEDBACK_PROVIDER) private readonly provider: FeedbackProvider,
    @Inject(SCENARIO_ANSWER_STORE) private readonly store: ScenarioAnswerStore,
  ) {}

  async review(request: FeedbackRequest): Promise<ScenarioFeedback> {
    const deck = this.decks.get(request.deckId);
    if (!deck) throw new NotFoundException(`Unknown deck "${request.deckId}"`);
    const feedback = await this.provider.review({ ...request, deck });
    const { pronunciation: _scores, ...answer } = request;
    await this.store.save({
      ...answer,
      provider: this.provider.name,
      feedback,
    });
    return feedback;
  }
}
