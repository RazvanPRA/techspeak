import type { TalkRecord } from '../model/records';

/** The long talks of the talk check. */
export interface TalkRepository {
  save(record: TalkRecord): Promise<void>;
  /** Oldest first, so the first entry is the baseline. */
  list(): Promise<TalkRecord[]>;
}
