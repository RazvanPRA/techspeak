import { emptyBatch, type LocalRows } from '../model/types';
import { selectUnsynced } from '../services/selectUnsynced.service';
import { pair, vocab } from '../testing/fixtures';

const rows = (patch: Partial<LocalRows>): LocalRows => ({
  ...emptyBatch(),
  ...patch,
}) as LocalRows;

describe('selectUnsynced', () => {
  it('returns no batch when everything was uploaded', () => {
    expect(
      selectUnsynced(
        rows({
          pairAttempts: [{ ...pair('p1'), synced: true }],
          vocabularyStates: [{ ...vocab('10:00'), syncedAt: '2026-11-18T10:00:00.000Z' }],
        }),
      ),
    ).toEqual([]);
  });

  it('picks rows not uploaded yet, without their sync flags', () => {
    const [batch] = selectUnsynced(
      rows({ pairAttempts: [{ ...pair('p1'), synced: false }, { ...pair('p2'), synced: true }] }),
    );
    expect(batch).toEqual({ ...emptyBatch(), pairAttempts: [pair('p1')] });
  });

  it('picks a vocabulary state never uploaded or changed after its upload', () => {
    const [batch] = selectUnsynced(
      rows({
        vocabularyStates: [
          { ...vocab('10:00', 'never'), syncedAt: null },
          { ...vocab('11:00', 'changed'), syncedAt: '2026-11-18T10:00:00.000Z' },
          { ...vocab('10:00', 'same'), syncedAt: '2026-11-18T10:00:00.000Z' },
        ],
      }),
    );
    expect(batch?.vocabularyStates.map(v => v.term)).toEqual(['never', 'changed']);
  });

  it('splits into batches of at most `size` rows per kind', () => {
    const many = ['a', 'b', 'c', 'd', 'e'].map(id => ({ ...pair(id), synced: false }));
    const batches = selectUnsynced(
      rows({ pairAttempts: many, vocabularyStates: [{ ...vocab('10:00'), syncedAt: null }] }),
      2,
    );
    expect(batches.map(b => b.pairAttempts.map(p => p.id))).toEqual([['a', 'b'], ['c', 'd'], ['e']]);
    expect(batches.map(b => b.vocabularyStates.length)).toEqual([1, 0, 0]);
  });
});
