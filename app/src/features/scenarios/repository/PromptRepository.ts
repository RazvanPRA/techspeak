import type { PromptGroup, ScenarioPrompt } from '../model/types';

/** The speaking prompts, grouped by topic deck. */
export interface PromptRepository {
  listGroups(): PromptGroup[];
  getPrompt(id: string): ScenarioPrompt | undefined;
}
