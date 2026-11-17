import type { z } from 'zod';
import type { ScenarioFeedbackSchema } from './schemas';

export type ScenarioPrompt = { id: string; deckId: string; topic: string; text: string };

export type PromptGroup = { topic: string; deckId: string; prompts: ScenarioPrompt[] };

export type ScenarioFeedback = z.infer<typeof ScenarioFeedbackSchema>;

export type FeedbackRequest = {
  prompt: string;
  deckId: string;
  transcript: string;
  durationSeconds: number;
};

export type FluencySummary = {
  wordCount: number;
  wordsPerMinute: number;
  fillerCount: number;
  fillers: string[];
};

/** Everything the feedback screen shows. `feedback` is null when the server was unreachable. */
export type AnswerResult = {
  prompt: ScenarioPrompt;
  transcript: string;
  durationSeconds: number;
  feedback: ScenarioFeedback | null;
  localFluency: FluencySummary;
  /** Why server feedback is missing, if it is. */
  feedbackError: string | null;
};

export type AnswerPhase = 'idle' | 'recording' | 'processing';
