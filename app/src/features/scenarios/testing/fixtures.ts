import type { FeedbackRequest, ScenarioFeedback } from '../model/types';
import type { FeedbackRepository } from '../repository/FeedbackRepository';

export const sampleFeedback: ScenarioFeedback = {
  overallScore: 72,
  strength: 'Your pace of 128 words per minute is easy to follow.',
  corrections: [],
  pronunciation: [{ word: 'query', ipa: '/ˈkwɪri/', tip: '"KWEE-ree"' }],
  fluency: { wordsPerMinute: 128, fillerCount: 2, fillers: ['um'], tip: 'Good flow.' },
  improvedAnswer: '',
  phrasesToReuse: [
    'Use EXPLAIN ANALYZE to see why the query is slow.',
    'Add an index on the foreign key.',
    'Check the plan again after the change.',
  ],
  vocabulary: { used: ['query', 'index'], missing: ['transaction'] },
};

/** Test double: answers with fixed feedback (or fails) and records every request. */
export class FakeFeedbackRepository implements FeedbackRepository {
  readonly requests: FeedbackRequest[] = [];
  constructor(public reply: ScenarioFeedback | Error = sampleFeedback) {}
  async review(request: FeedbackRequest): Promise<ScenarioFeedback> {
    this.requests.push(request);
    if (this.reply instanceof Error) throw this.reply;
    return this.reply;
  }
}
