import type { ScenarioFeedback } from '../feedback.schema.js';

export type ScenarioAnswerToSave = {
  prompt: string;
  deckId: string;
  transcript: string;
  durationSeconds: number;
  provider: string;
  feedback: ScenarioFeedback;
};

/** Where scenario answers and their feedback are kept. */
export interface ScenarioAnswerStore {
  save(answer: ScenarioAnswerToSave): Promise<void>;
}

export const SCENARIO_ANSWER_STORE = Symbol('ScenarioAnswerStore');
