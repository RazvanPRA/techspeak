import { MIGRATIONS, runMigrations } from '@/services/db';
import { NodeSqliteExecutor } from '@/services/db/testing/NodeSqliteExecutor';
import { SqliteScenarioAnswerRepository } from '../repository/SqliteScenarioAnswerRepository';
import { SqliteTalkRepository } from '../repository/SqliteTalkRepository';
import { toAnswerRecord } from '../services/toAnswerRecord.service';
import { sampleFeedback } from '../testing/fixtures';

async function database() {
  const db = new NodeSqliteExecutor();
  await runMigrations(db, MIGRATIONS);
  return db;
}

const record = (promptId: string, score: number | null) => ({
  promptId,
  deckId: 'sql',
  durationSeconds: 75.5,
  wordsPerMinute: 128,
  fillers: 2,
  score,
  transcript: 'we add an index',
  createdAt: '2026-11-18T10:00:00.000Z',
});

describe('SqliteScenarioAnswerRepository', () => {
  it('round-trips answers, newest first, with or without a score', async () => {
    const repo = new SqliteScenarioAnswerRepository(await database());
    await repo.save(record('sql-1', 72));
    await repo.save(record('sql-2', null));
    expect(await repo.listRecent(5)).toEqual([record('sql-2', null), record('sql-1', 72)]);
    expect(await repo.listRecent(1)).toHaveLength(1);
  });
});

describe('SqliteTalkRepository', () => {
  it('lists talks oldest first, so the first one is the baseline', async () => {
    const repo = new SqliteTalkRepository(await database());
    const talk = (audioPath: string) => ({
      audioPath,
      durationSeconds: 180,
      transcript: 'a talk',
      wordsPerMinute: 120,
      fillers: 5,
      createdAt: '2026-11-18T10:00:00.000Z',
    });
    await repo.save(talk('/day1.wav'));
    await repo.save(talk('/day28.wav'));
    expect((await repo.list()).map(t => t.audioPath)).toEqual(['/day1.wav', '/day28.wav']);
  });
});

describe('toAnswerRecord', () => {
  const prompt = { id: 'sql-1', deckId: 'sql', topic: 'SQL', text: 'Explain indexes' };
  const localFluency = { wordCount: 150, wordsPerMinute: 110, fillerCount: 4, fillers: ['um'] };
  const base = { prompt, transcript: 'x', durationSeconds: 80, localFluency, feedbackError: null };

  it('uses the server score and fluency when there is feedback', () => {
    expect(toAnswerRecord({ ...base, feedback: sampleFeedback }, 'now')).toEqual({
      promptId: 'sql-1',
      deckId: 'sql',
      durationSeconds: 80,
      wordsPerMinute: 128,
      fillers: 2,
      score: 72,
      transcript: 'x',
      createdAt: 'now',
    });
  });

  it('falls back to the on-device fluency and no score', () => {
    const r = toAnswerRecord({ ...base, feedback: null }, 'now');
    expect(r).toEqual(expect.objectContaining({ wordsPerMinute: 110, fillers: 4, score: null }));
  });
});
