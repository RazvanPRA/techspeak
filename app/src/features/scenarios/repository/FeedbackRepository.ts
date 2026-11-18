import type { FeedbackRequest, ScenarioFeedback } from '../model/types';

/** Feedback on a spoken answer. Remote (the TechSpeak server) today. */
export interface FeedbackRepository {
  review(request: FeedbackRequest): Promise<ScenarioFeedback>;
}
