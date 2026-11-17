import { MIGRATIONS, runMigrations } from '@/services/db';
import { NodeSqliteExecutor } from '@/services/db/testing/NodeSqliteExecutor';
import type { AttemptRecord } from '../model/types';
import { SqliteAttemptRepository } from '../repository/SqliteAttemptRepository';

const attempt = (deckId: string, sentenceIndex: number): AttemptRecord => ({
  deckId,
  sentenceIndex,
  score: 80,
  transcript: 'the query is slow',
  audioPath: `/attempt-${sentenceIndex}.wav`,
  createdAt: '2026-11-17T10:00:00.000Z',
  words: [
    { kind: 'ok', targetIndex: 0, word: 'the' },
    { kind: 'wrong', targetIndex: 1, word: 'query', spoken: 'curry' },
    { kind: 'extra', spoken: 'um' },
  ],
});

async function setup() {
  const db = new NodeSqliteExecutor();
  await runMigrations(db, MIGRATIONS);
  return new SqliteAttemptRepository(db);
}

describe('SqliteAttemptRepository', () => {
  it('round-trips an attempt, including its word results', async () => {
    const repo = await setup();
    await repo.save(attempt('sql', 0));
    expect(await repo.listByDeck('sql')).toEqual([attempt('sql', 0)]);
  });

  it('filters by deck', async () => {
    const repo = await setup();
    await repo.save(attempt('sql', 0));
    await repo.save(attempt('go', 1));
    expect((await repo.listByDeck('go')).map(a => a.sentenceIndex)).toEqual([1]);
  });

  it('lists the most recent attempts first, up to the limit', async () => {
    const repo = await setup();
    for (const i of [0, 1, 2]) await repo.save(attempt('sql', i));
    expect((await repo.listRecent(2)).map(a => a.sentenceIndex)).toEqual([2, 1]);
  });
});
