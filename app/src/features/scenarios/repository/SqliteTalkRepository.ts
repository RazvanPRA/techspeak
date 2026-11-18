import { NEW_SYNC_ID_SQL, type SqlExecutor, type SqlRow } from '@/services/db';
import { TalkRecordSchema, type TalkRecord } from '../model/records';
import type { TalkRepository } from './TalkRepository';

const COLUMNS = 'audio_path, duration_s, transcript, wpm, fillers, created_at';

function toRecord(row: SqlRow): TalkRecord {
  return TalkRecordSchema.parse({
    audioPath: row.audio_path,
    durationSeconds: row.duration_s,
    transcript: row.transcript,
    wordsPerMinute: row.wpm,
    fillers: row.fillers,
    createdAt: row.created_at,
  });
}


export class SqliteTalkRepository implements TalkRepository {
  constructor(private readonly db: SqlExecutor) {}

  async save(r: TalkRecord): Promise<void> {
    await this.db.execute(`INSERT INTO talks (${COLUMNS}, sync_id) VALUES (?, ?, ?, ?, ?, ?, ${NEW_SYNC_ID_SQL})`, [
      r.audioPath,
      r.durationSeconds,
      r.transcript,
      Math.round(r.wordsPerMinute),
      r.fillers,
      r.createdAt,
    ]);
  }

  async list(): Promise<TalkRecord[]> {
    const rows = await this.db.execute(`SELECT ${COLUMNS} FROM talks ORDER BY id`);
    return rows.map(toRecord);
  }
}
