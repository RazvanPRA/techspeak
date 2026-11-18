import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { createTestSyncDependencies, SyncDependenciesProvider } from '@/features/sync';
import { InMemoryReminderRepository } from '@/services/reminders';
import { InMemoryKeyValueStore, KeyValueSettingsRepository } from '@/services/settings';
import type { TtsVoice } from '@/services/speech';
import { FakeTtsRepository } from '@/services/speech/testing/fakes';
import {
  type SessionDependencies,
  SessionDependenciesProvider,
} from '../dependencies/SessionDependencies';
import { SettingsScreen } from '../screens/SettingsScreen';

const VOICES: TtsVoice[] = [
  { id: 'en-us-zoe', name: 'Zoe', language: 'en-US' },
  { id: 'en-gb-daniel', name: 'Daniel', language: 'en-GB' },
];
const PREVIEW = "Let's walk through the pull request before the standup.";

async function setup(tts = new FakeTtsRepository(VOICES)) {
  const settings = new KeyValueSettingsRepository(new InMemoryKeyValueStore());
  const deps: SessionDependencies = {
    settings,
    reminders: new InMemoryReminderRepository(),
    tts,
    dueCount: async () => 0,
    weakSounds: async () => [],
    shadowingDeckIds: [],
    promptIds: [],
    clock: () => new Date('2026-11-18T10:00:00.000Z'),
    random: () => 0,
  };
  await render(
    <SessionDependenciesProvider value={deps}>
      <SyncDependenciesProvider value={createTestSyncDependencies(deps.clock)}>
        <SettingsScreen />
      </SyncDependenciesProvider>
    </SessionDependenciesProvider>,
  );
  return { settings, tts };
}

describe('SettingsScreen — model voice', () => {
  it('lists the system voice and the installed voices, system voice chosen', async () => {
    await setup();
    expect(await screen.findByRole('radio', { name: 'Daniel, British English' })).toBeOnTheScreen();
    expect(screen.getByRole('radio', { name: 'Zoe, American English' })).toBeOnTheScreen();
    const system = screen.getByRole('radio', { name: /^System voice/ });
    expect(system).toBeChecked();
  });

  it('saves the chosen voice, and the system voice as null', async () => {
    const { settings } = await setup();
    await fireEvent.press(await screen.findByRole('radio', { name: 'Zoe, American English' }));
    expect(settings.get().voiceId).toBe('en-us-zoe');
    expect(screen.getByRole('radio', { name: 'Zoe, American English' })).toBeChecked();
    expect(screen.getByRole('radio', { name: /^System voice/ })).not.toBeChecked();
    await fireEvent.press(screen.getByRole('radio', { name: /^System voice/ }));
    expect(settings.get().voiceId).toBeNull();
  });

  it('previews a voice without choosing it', async () => {
    const { settings, tts } = await setup();
    await screen.findByRole('radio', { name: 'Daniel, British English' });
    const previews = screen.getAllByRole('button', { name: 'Preview' });
    // Order: system voice, then en-GB Daniel, then en-US Zoe.
    await fireEvent.press(previews[1]!);
    await fireEvent.press(previews[0]!);
    expect(tts.spoken).toEqual([
      { text: PREVIEW, options: { rate: 1, voiceId: 'en-gb-daniel' } },
      { text: PREVIEW, options: { rate: 1 } },
    ]);
    expect(settings.get().voiceId).toBeNull();
  });

  it('shows an error and keeps the system voice when voices cannot be listed', async () => {
    const tts = new FakeTtsRepository(VOICES);
    jest.spyOn(tts, 'listVoices').mockRejectedValue(new Error('engine not ready'));
    await setup(tts);
    expect(
      await screen.findByText('Could not load the installed voices. The system voice is used.'),
    ).toBeOnTheScreen();
    expect(screen.getByRole('radio', { name: /^System voice/ })).toBeOnTheScreen();
  });
});
