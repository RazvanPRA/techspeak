import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { MIGRATIONS, runMigrations } from '@/services/db';
import { NodeSqliteExecutor } from '@/services/db/testing/NodeSqliteExecutor';
import { SyncOnLaunch } from '../components/SyncOnLaunch';
import { SyncRow } from '../components/SyncRow';
import { SyncDependenciesProvider } from '../dependencies/SyncDependencies';
import { SqliteLocalSyncStore } from '../repository/SqliteLocalSyncStore';
import { createSyncRunner } from '../services/runSync';
import { SyncStatusStore } from '../services/SyncStatusStore';
import { createTestSyncDependencies } from '../testing/createTestSyncDependencies';
import { FakeSyncServer } from '../testing/FakeSyncServer';

// Local time on the same day, so the caption says "today".
const now = new Date(2026, 10, 18, 15, 4);
const clock = () => now;

async function setup(server = new FakeSyncServer()) {
  const db = new NodeSqliteExecutor();
  await runMigrations(db, MIGRATIONS);
  const local = new SqliteLocalSyncStore(db);
  const run = createSyncRunner({ local, remote: server, clock });
  const deps = { status: new SyncStatusStore(run, () => local.readMeta()), clock };
  await render(
    <SyncDependenciesProvider value={deps}>
      <SyncRow />
    </SyncDependenciesProvider>,
  );
  return { server, local };
}

const syncNow = () => screen.findByRole('button', { name: /^Sync now/ });

describe('SyncRow', () => {
  it('syncs on press and shows the last sync time', async () => {
    await setup();
    expect(await syncNow()).toHaveAccessibleName('Sync now, Not synced yet.');
    await fireEvent.press(await syncNow());
    expect(await screen.findByRole('button', { name: 'Sync now, Last sync: today, 15:04.' })).toBeOnTheScreen();
  });

  it('says it will try again later when offline', async () => {
    const server = new FakeSyncServer();
    server.offline = true;
    await setup(server);
    await fireEvent.press(await syncNow());
    expect(
      await screen.findByRole('button', {
        name: 'Sync now, Offline. Will try again later. Not synced yet.',
      }),
    ).toBeOnTheScreen();
  });

  it('explains that sync needs a server when none is configured', async () => {
    await render(
      <SyncDependenciesProvider value={createTestSyncDependencies(clock)}>
        <SyncRow />
      </SyncDependenciesProvider>,
    );
    await fireEvent.press(await syncNow());
    expect(await screen.findByText(/needs the TechSpeak server/)).toBeOnTheScreen();
  });
});

describe('SyncOnLaunch', () => {
  it('syncs once in the background and renders nothing', async () => {
    const run = jest.fn(async () => ({ uploaded: 0, downloaded: 0, lastSyncedAt: now.toISOString() }));
    const deps = createTestSyncDependencies(clock, run);
    await render(
      <SyncDependenciesProvider value={deps}>
        <SyncOnLaunch />
        <SyncRow />
      </SyncDependenciesProvider>,
    );
    expect(await screen.findByRole('button', { name: 'Sync now, Last sync: today, 15:04.' })).toBeOnTheScreen();
    expect(run).toHaveBeenCalledTimes(1);
  });
});
