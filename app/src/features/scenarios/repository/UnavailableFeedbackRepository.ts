import type { ScenarioFeedback } from '../model/types';
import type { FeedbackRepository } from './FeedbackRepository';

/** Used when the build has no server (release builds for now): the screen shows the offline summary. */
export class UnavailableFeedbackRepository implements FeedbackRepository {
  review(): Promise<ScenarioFeedback> {
    return Promise.reject(new Error('Feedback needs the TechSpeak server, which is not set up in this build.'));
  }
}
