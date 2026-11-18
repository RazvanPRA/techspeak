import type {
  ScenarioAnswerStore,
  ScenarioAnswerToSave,
} from './scenario-answer-store.js';

/** Test double: keeps answers in an array. */
export class InMemoryScenarioAnswerStore implements ScenarioAnswerStore {
  readonly saved: ScenarioAnswerToSave[] = [];

  async save(answer: ScenarioAnswerToSave): Promise<void> {
    this.saved.push(answer);
  }
}
