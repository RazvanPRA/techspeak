import { ApiError } from '@/services/api';
import { MIGRATIONS, NEW_SYNC_ID_SQL, runMigrations, type SqlExecutor } from '@/services/db';
import { NodeSqliteExecutor } from '@/services/db/testing/NodeSqliteExecutor';
import { SqliteLocalSyncStore } from '../repository/SqliteLocalSyncStore';
import { createSyncRunner, runSync } from '../services/runSync';
import { selectUnsynced } from '../services/selectUnsynced.service';
import { FakeSyncServer } from '../testing/FakeSyncServer';

const clock = () => new Date('2026-11-18T15:00:00.000Z');

/** A fresh install: migrated SQLite + its sync store. */
async function device() {
  const db = new NodeSqliteExecutor();
  await runMigrations(db, MIGRATIONS);
  return { db, local: new SqliteLocalSyncStore(db) };
}

// Rows written the way the feature repositories write them.
const seed = {
  attempt: (db: SqlExecutor) =>
    db.execute(
      `INSERT INTO attempts (deck_id, sentence_index, score, transcript, words_json, audio_path,
        created_at, details_json, sync_id) VALUES ('sql', 2, 85, 'select star', '[{"w":1}]',
        '/a.wav', '2026-11-18T09:00:00.000Z', '{"accuracy":90}', ${NEW_SYNC_ID_SQL})`,
    ),
  pair: (db: SqlExecutor, n = 1) =>
    Promise.all(
      Array.from({ length: n }, (_, i) =>
        db.execute(
          `INSERT INTO pair_attempts (pair_id, sound, mode, correct, created_at, sync_id)
            VALUES ('ship-sheep', 'ɪ-iː', 'say', ?, '2026-11-18T09:0${i}:00.000Z', ${NEW_SYNC_ID_SQL})`,
          [i % 2],
        ),
      ),
    ),
  answer: (db: SqlExecutor) =>
    db.execute(
      `INSERT INTO scenario_answers (prompt_id, deck_id, duration_s, wpm, fillers, score,
        transcript, created_at, sync_id) VALUES ('sql-1', 'sql', 42.5, 120, 2, NULL, 'an index',
        '2026-11-18T09:00:00.000Z', ${NEW_SYNC_ID_SQL})`,
    ),
  talk: (db: SqlExecutor) =>
    db.execute(
      `INSERT INTO talks (audio_path, duration_s, transcript, wpm, fillers, created_at, sync_id)
        VALUES ('/talks/1.wav', 180, 'about indexes', 130, 3, '2026-11-18T09:00:00.000Z',
        ${NEW_SYNC_ID_SQL})`,
    ),
  review: (db: SqlExecutor, interval: number, updatedAt: string) =>
    db.execute(
      `INSERT OR REPLACE INTO review_state (deck_id, term, ease, interval, repetitions, due_at,
        lapses, updated_at) VALUES ('sql', 'query', 2.5, ?, 1, '2026-11-19T09:00:00.000Z', 0, ?)`,
      [interval, updatedAt],
    ),
};

const contents = (db: SqlExecutor) =>
  Promise.all([
    db.execute(`SELECT sync_id, deck_id, sentence_index, score, transcript, words_json,
      details_json, created_at FROM attempts ORDER BY created_at`),
    db.execute('SELECT sync_id, pair_id, sound, mode, correct, created_at FROM pair_attempts ORDER BY created_at'),
    db.execute(`SELECT sync_id, prompt_id, deck_id, duration_s, wpm, fillers, score, transcript,
      created_at FROM scenario_answers`),
    db.execute('SELECT sync_id, duration_s, transcript, wpm, fillers, created_at FROM talks'),
    db.execute('SELECT deck_id, term, ease, interval, repetitions, due_at, lapses, updated_at FROM review_state'),
  ]);

async function phoneWithEverything() {
  const phone = await device();
  await seed.attempt(phone.db);
  await seed.pair(phone.db, 2);
  await seed.answer(phone.db);
  await seed.talk(phone.db);
  await seed.review(phone.db, 6, '2026-11-18T10:00:00.000Z');
  return phone;
}

describe('runSync', () => {
  it('uploads a phone and restores everything on a fresh install', async () => {
    const server = new FakeSyncServer();
    const a = await phoneWithEverything();
    await expect(runSync({ local: a.local, remote: server, clock })).resolves.toMatchObject({
      uploaded: 6,
    });

    const b = await device();
    const result = await runSync({ local: b.local, remote: server, clock });
    expect(result).toEqual({ uploaded: 0, downloaded: 6, lastSyncedAt: '2026-11-18T15:00:00.000Z' });
    expect(await contents(b.db)).toEqual(await contents(a.db));
    // The audio stays on the old phone; restored rows are already uploaded.
    expect(await b.db.execute('SELECT audio_path FROM talks')).toEqual([{ audio_path: '' }]);
    expect(selectUnsynced(await b.local.listPending())).toEqual([]);
    expect(await b.local.readMeta()).toMatchObject({ lastSyncedAt: '2026-11-18T15:00:00.000Z' });
  });

  it('is idempotent: a second sync uploads and downloads nothing', async () => {
    const server = new FakeSyncServer();
    const a = await phoneWithEverything();
    await runSync({ local: a.local, remote: server, clock });
    const before = await contents(a.db);
    await expect(runSync({ local: a.local, remote: server, clock })).resolves.toMatchObject({
      uploaded: 0,
      downloaded: 0,
    });
    expect(server.count('pairAttempts')).toBe(2);
    expect(await contents(a.db)).toEqual(before);
  });

  it('vocabulary: the newest review wins on both phones', async () => {
    const server = new FakeSyncServer();
    const a = await device();
    const b = await device();
    await seed.review(a.db, 1, '2026-11-18T09:00:00.000Z');
    await seed.review(b.db, 6, '2026-11-18T11:00:00.000Z');
    await runSync({ local: a.local, remote: server, clock });
    await runSync({ local: b.local, remote: server, clock }); // b is newer: keeps its own
    await runSync({ local: a.local, remote: server, clock }); // a gets b's state
    const interval = async (db: SqlExecutor) =>
      (await db.execute('SELECT interval FROM review_state'))[0]?.interval;
    expect(await interval(a.db)).toBe(6);
    expect(await interval(b.db)).toBe(6);
  });

  it('keeps a review made during the upload pending', async () => {
    const a = await device();
    await seed.review(a.db, 1, '2026-11-18T09:00:00.000Z');
    const [batch] = selectUnsynced(await a.local.listPending());
    await seed.review(a.db, 6, '2026-11-18T09:30:00.000Z'); // reviewed while uploading
    await a.local.markUploaded(batch!);
    const [still] = selectUnsynced(await a.local.listPending());
    expect(still?.vocabularyStates.map(v => v.interval)).toEqual([6]);
  });

  it('offline: fails without losing anything, then catches up', async () => {
    const server = new FakeSyncServer();
    server.offline = true;
    const a = await phoneWithEverything();
    await expect(runSync({ local: a.local, remote: server, clock })).rejects.toBeInstanceOf(ApiError);
    expect(await a.local.readMeta()).toEqual({ cursor: null, lastSyncedAt: null });
    server.offline = false;
    await expect(runSync({ local: a.local, remote: server, clock })).resolves.toMatchObject({
      uploaded: 6,
    });
  });

  it('downloads every page', async () => {
    const server = new FakeSyncServer(2);
    const a = await device();
    await seed.pair(a.db, 5);
    await runSync({ local: a.local, remote: server, clock });
    const b = await device();
    await expect(runSync({ local: b.local, remote: server, clock })).resolves.toMatchObject({
      downloaded: 5,
    });
  });

  it('runs one sync at a time', async () => {
    const server = new FakeSyncServer();
    const a = await phoneWithEverything();
    const sync = createSyncRunner({ local: a.local, remote: server, clock });
    const [first, second] = await Promise.all([sync(), sync()]);
    expect(second).toBe(first);
    expect(server.pushes).toBe(1);
  });
});
