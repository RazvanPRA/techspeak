import type { ScenarioAnswerRecord } from '../model/records';

/** Every scenario answer, kept on the device for the progress trends. */
export interface ScenarioAnswerRepository {
  save(record: ScenarioAnswerRecord): Promise<void>;
  /** Newest first. */
  listRecent(limit: number): Promise<ScenarioAnswerRecord[]>;
}
