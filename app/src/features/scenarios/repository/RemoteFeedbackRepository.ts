import type { HttpClient } from '@/services/api';
import { ScenarioFeedbackSchema } from '../model/schemas';
import type { FeedbackRequest, ScenarioFeedback } from '../model/types';
import type { FeedbackRepository } from './FeedbackRepository';

/** POST /feedback on the TechSpeak server (free, rule-based feedback). */
export class RemoteFeedbackRepository implements FeedbackRepository {
  constructor(private readonly http: Pick<HttpClient, 'postJson'>) {}

  review(request: FeedbackRequest): Promise<ScenarioFeedback> {
    return this.http.postJson('/feedback', request, ScenarioFeedbackSchema);
  }
}
