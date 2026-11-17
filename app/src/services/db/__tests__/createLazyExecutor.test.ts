import { createLazyExecutor } from '../createLazyExecutor';
import { FakeSqlExecutor } from '../testing/FakeSqlExecutor';

describe('createLazyExecutor', () => {
  it('opens once, on the first statement', async () => {
    const inner = new FakeSqlExecutor();
    const open = jest.fn(async () => inner);
    const db = createLazyExecutor(open);
    expect(open).not.toHaveBeenCalled();
    await Promise.all([db.execute('SELECT 1'), db.execute('SELECT 2')]);
    expect(open).toHaveBeenCalledTimes(1);
    expect(inner.statements).toEqual(['SELECT 1', 'SELECT 2']);
  });

  it('retries opening after a failure', async () => {
    const inner = new FakeSqlExecutor();
    const open = jest
      .fn<Promise<FakeSqlExecutor>, []>()
      .mockRejectedValueOnce(new Error('locked'))
      .mockResolvedValue(inner);
    const db = createLazyExecutor(open);
    await expect(db.execute('SELECT 1')).rejects.toThrow('locked');
    await db.execute('SELECT 1');
    expect(open).toHaveBeenCalledTimes(2);
    expect(inner.statements).toEqual(['SELECT 1']);
  });
});
