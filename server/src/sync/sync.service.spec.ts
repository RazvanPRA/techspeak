import { BadRequestException } from '@nestjs/common';
import { InMemorySyncStore } from './store/in-memory-sync.store.js';
import { SyncService } from './sync.service.js';
import {
  emptyBatch,
  fullBatch,
  shadowingAttempt,
  vocabularyState,
} from './testing/sync-fixtures.js';

const setup = (pageSize = 200) =>
  new SyncService(new InMemorySyncStore(), pageSize);

describe('SyncService', () => {
  it('stores a batch and gives every row back on a first download', async () => {
    const sync = setup();
    expect(await sync.upload(fullBatch())).toEqual({ received: 5 });
    const { changes, cursor, hasMore } = await sync.download(undefined);
    expect(changes).toEqual(fullBatch());
    // The in-memory store numbers rows across tables; PostgreSQL counts per table.
    expect(cursor).toBe('s1.p2.v3.a4.t5');
    expect(hasMore).toBe(false);
  });

  it('is idempotent: uploading the same batch twice stores nothing new', async () => {
    const sync = setup();
    await sync.upload(fullBatch());
    const first = await sync.download(undefined);
    await sync.upload(fullBatch());
    expect(await sync.download(undefined)).toEqual(first);
    expect((await sync.download(first.cursor)).changes).toEqual(emptyBatch());
  });

  it('returns only rows after the cursor', async () => {
    const sync = setup();
    await sync.upload({
      ...emptyBatch(),
      shadowingAttempts: [shadowingAttempt('s-1')],
    });
    const { cursor } = await sync.download(undefined);
    await sync.upload({
      ...emptyBatch(),
      shadowingAttempts: [shadowingAttempt('s-2')],
    });
    const { changes } = await sync.download(cursor);
    expect(changes.shadowingAttempts.map((a) => a.id)).toEqual(['s-2']);
  });

  describe('vocabulary: last write wins by updatedAt', () => {
    it('replaces a state with a newer one and sends it again', async () => {
      const sync = setup();
      await sync.upload({
        ...emptyBatch(),
        vocabularyStates: [vocabularyState('2026-11-18T09:00:00.000Z')],
      });
      const { cursor } = await sync.download(undefined);
      const newer = vocabularyState('2026-11-18T10:00:00.000Z', {
        interval: 6,
      });
      await sync.upload({ ...emptyBatch(), vocabularyStates: [newer] });
      expect((await sync.download(cursor)).changes.vocabularyStates).toEqual([
        newer,
      ]);
      expect((await sync.download(undefined)).changes.vocabularyStates).toEqual(
        [newer],
      );
    });

    it('ignores an older state', async () => {
      const sync = setup();
      const current = vocabularyState('2026-11-18T10:00:00.000Z', {
        interval: 6,
      });
      await sync.upload({ ...emptyBatch(), vocabularyStates: [current] });
      const { cursor } = await sync.download(undefined);
      await sync.upload({
        ...emptyBatch(),
        vocabularyStates: [
          vocabularyState('2026-11-18T09:00:00.000Z', { interval: 1 }),
        ],
      });
      expect((await sync.download(cursor)).changes.vocabularyStates).toEqual(
        [],
      );
      expect((await sync.download(undefined)).changes.vocabularyStates).toEqual(
        [current],
      );
    });
  });

  it('pages: hasMore until every row was downloaded', async () => {
    const sync = setup(2);
    await sync.upload({
      ...emptyBatch(),
      shadowingAttempts: ['s-1', 's-2', 's-3'].map(shadowingAttempt),
    });
    const first = await sync.download(undefined);
    expect(first.changes.shadowingAttempts).toHaveLength(2);
    expect(first.hasMore).toBe(true);
    const second = await sync.download(first.cursor);
    expect(second.changes.shadowingAttempts.map((a) => a.id)).toEqual(['s-3']);
    expect(second.hasMore).toBe(false);
  });

  it('rejects a malformed cursor', async () => {
    await expect(setup().download('nope')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });
});
