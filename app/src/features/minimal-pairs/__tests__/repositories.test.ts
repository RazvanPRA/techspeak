import minimalPairs from '@/content/minimal-pairs.json';
import { MIGRATIONS, runMigrations } from '@/services/db';
import { NodeSqliteExecutor } from '@/services/db/testing/NodeSqliteExecutor';
import type { PairAttempt } from '../model/types';
import { InMemoryPairAttemptRepository } from '../repository/InMemoryPairAttemptRepository';
import type { PairAttemptRepository } from '../repository/PairAttemptRepository';
import { SeedPairRepository } from '../repository/SeedPairRepository';
import { SqlitePairAttemptRepository } from '../repository/SqlitePairAttemptRepository';

describe('minimal-pairs content', () => {
  const pairs = new SeedPairRepository(minimalPairs).list();

  it('contains every pair from SPEC 3.3', () => {
    const ids = pairs.map(p => p.id);
    for (const id of [
      'think-sink',
      'three-tree',
      'they-day',
      'west-vest',
      'wine-vine',
      'ship-sheep',
      'full-fool',
      'bad-bed',
      'walked-wanted',
    ]) {
      expect(ids).toContain(id);
    }
  });

  it('covers all 8 sound contrasts, with unique ids and a tip for every pair', () => {
    expect(new Set(pairs.map(p => p.sound)).size).toBe(8);
    expect(new Set(pairs.map(p => p.id)).size).toBe(pairs.length);
    expect(pairs.every(p => p.tip !== null)).toBe(true);
  });

  it('rejects an invalid seed', () => {
    expect(() => new SeedPairRepository([{ id: 'x', sound: 'zz' }])).toThrow();
    expect(() => new SeedPairRepository([])).toThrow();
  });
});

async function sqlite(): Promise<PairAttemptRepository> {
  const db = new NodeSqliteExecutor();
  await runMigrations(db, MIGRATIONS);
  return new SqlitePairAttemptRepository(db);
}

const attempt = (pairId: string, correct: boolean): PairAttempt => ({
  pairId,
  sound: 'θ-s',
  mode: 'listen',
  correct,
  createdAt: '2026-11-17T10:00:00.000Z',
});

describe.each([
  ['SqlitePairAttemptRepository', sqlite],
  ['InMemoryPairAttemptRepository', async () => new InMemoryPairAttemptRepository()],
] as Array<[string, () => Promise<PairAttemptRepository>]>)('%s', (_, create) => {
  it('round-trips attempts, newest first, up to the limit', async () => {
    const repo = await create();
    await repo.save(attempt('think-sink', true));
    await repo.save({ ...attempt('west-vest', false), sound: 'w-v', mode: 'say' });
    await repo.save(attempt('thick-sick', true));
    const recent = await repo.listRecent(2);
    expect(recent).toEqual([
      attempt('thick-sick', true),
      { ...attempt('west-vest', false), sound: 'w-v', mode: 'say' },
    ]);
  });
});
