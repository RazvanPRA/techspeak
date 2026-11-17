import { MIGRATIONS, runMigrations } from '@/services/db';
import { NodeSqliteExecutor } from '@/services/db/testing/NodeSqliteExecutor';
import { InMemoryVocabularyRepository } from '../repository/InMemoryVocabularyRepository';
import { SqliteVocabularyRepository } from '../repository/SqliteVocabularyRepository';
import type { VocabularyRepository } from '../repository/VocabularyRepository';
import { makeState } from '../testing/fixtures';

async function sqlite(): Promise<VocabularyRepository> {
  const db = new NodeSqliteExecutor();
  await runMigrations(db, MIGRATIONS);
  return new SqliteVocabularyRepository(db);
}

const implementations: Array<[string, () => Promise<VocabularyRepository>]> = [
  ['SqliteVocabularyRepository', sqlite],
  ['InMemoryVocabularyRepository', async () => new InMemoryVocabularyRepository()],
];

describe.each(implementations)('%s', (_, create) => {
  it('round-trips a review state', async () => {
    const repo = await create();
    const state = makeState('sql', 'query', { ease: 2.36, interval: 6, lapses: 1 });
    await repo.saveReview(state);
    expect(await repo.listStates(['sql'])).toEqual([state]);
  });

  it('replaces the previous state of the same term', async () => {
    const repo = await create();
    await repo.saveReview(makeState('sql', 'query', { interval: 1 }));
    await repo.saveReview(makeState('sql', 'query', { interval: 6 }));
    const states = await repo.listStates(['sql']);
    expect(states.map(s => s.interval)).toEqual([6]);
  });

  it('filters by deck, and lists every deck without a filter', async () => {
    const repo = await create();
    await repo.saveReview(makeState('sql', 'index'));
    await repo.saveReview(makeState('nosql-mongodb', 'index'));
    expect((await repo.listStates(['nosql-mongodb'])).map(s => s.deckId)).toEqual(['nosql-mongodb']);
    expect(await repo.listStates([])).toEqual([]);
    expect(await repo.listStates()).toHaveLength(2);
  });
});
