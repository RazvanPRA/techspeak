import type { ScenarioAnswerRecord, TalkRecord } from '../model/records';
import type { ScenarioAnswerRepository } from './ScenarioAnswerRepository';
import type { TalkRepository } from './TalkRepository';

/** For tests. */
export class InMemoryScenarioAnswerRepository implements ScenarioAnswerRepository {
  readonly records: ScenarioAnswerRecord[] = [];

  async save(record: ScenarioAnswerRecord): Promise<void> {
    this.records.push(record);
  }

  async listRecent(limit: number): Promise<ScenarioAnswerRecord[]> {
    return [...this.records].reverse().slice(0, limit);
  }
}

/** For tests. */
export class InMemoryTalkRepository implements TalkRepository {
  readonly records: TalkRecord[] = [];

  async save(record: TalkRecord): Promise<void> {
    this.records.push(record);
  }

  async list(): Promise<TalkRecord[]> {
    return [...this.records];
  }
}
