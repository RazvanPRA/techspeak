import type { Deck } from '../../content/deck.schema.js';
import type { ScenarioFeedback } from '../feedback.schema.js';
import type { ScoredWord } from '../rules/pronunciation-tips.js';

export type FeedbackInput = {
  prompt: string;
  deck: Deck;
  transcript: string;
  durationSeconds: number;
  /** Azure word scores, when the app sends them. */
  pronunciation?: readonly ScoredWord[];
};

/**
 * Turns a spoken answer into feedback. Today: RuleBasedFeedbackProvider ($0).
 * Later: a Claude or local-model provider, swapped in FeedbackModule only.
 */
export interface FeedbackProvider {
  /** Stored with each answer, e.g. "rules". */
  readonly name: string;
  review(input: FeedbackInput): Promise<ScenarioFeedback>;
}

export const FEEDBACK_PROVIDER = Symbol('FeedbackProvider');
