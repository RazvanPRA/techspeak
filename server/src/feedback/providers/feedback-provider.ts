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

/** The feedback and the name of the provider that actually produced it. */
export type FeedbackReview = {
  feedback: ScenarioFeedback;
  /** Stored with each answer, e.g. "rules" or "ollama:qwen3.5:2b" (a fallback reports "rules"). */
  provider: string;
};

/**
 * Turns a spoken answer into feedback: RuleBasedFeedbackProvider ($0), optionally wrapped by
 * OllamaFeedbackProvider (local model, $0). Chosen in FeedbackModule only.
 */
export interface FeedbackProvider {
  readonly name: string;
  review(input: FeedbackInput): Promise<FeedbackReview>;
}

export const FEEDBACK_PROVIDER = Symbol('FeedbackProvider');
