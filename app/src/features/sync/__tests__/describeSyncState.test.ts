import { describeSyncState, formatSyncTime } from '../services/describeSyncState.service';

const now = new Date(2026, 10, 18, 15, 4);
const at = (d: number, h: number, m: number) => new Date(2026, 10, d, h, m).toISOString();

describe('formatSyncTime', () => {
  it('says "today" for the same local day, else the day and month', () => {
    expect(formatSyncTime(at(18, 9, 5), now)).toBe('today, 09:05');
    expect(formatSyncTime(at(17, 23, 59), now)).toBe('17 Nov, 23:59');
  });
});

describe('describeSyncState', () => {
  const state = (patch: object) => ({ status: 'idle' as const, lastSyncedAt: null, error: null, ...patch });

  it.each([
    [{}, 'Not synced yet.'],
    [{ status: 'done', lastSyncedAt: at(18, 15, 0) }, 'Last sync: today, 15:00.'],
    [{ status: 'syncing' }, 'Syncing…'],
    [{ status: 'offline', lastSyncedAt: at(17, 8, 0) }, 'Offline. Will try again later. Last sync: 17 Nov, 08:00.'],
    [{ status: 'unavailable' }, 'Sync needs the TechSpeak server (debug builds for now).'],
    [{ status: 'error', error: 'Server error 500' }, 'Sync failed: Server error 500. Not synced yet.'],
  ])('%j → %s', (patch, text) => {
    expect(describeSyncState(state(patch), now)).toBe(text);
  });
});
