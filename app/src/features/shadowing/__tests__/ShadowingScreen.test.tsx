import React from 'react';
import { configureStore } from '@reduxjs/toolkit';
import { fireEvent, render, screen, within } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { seedDecks } from '@/content/decks';
import { SeedDeckRepository } from '@/features/vocabulary';
import { defaultAliases } from '@/services/scoring';
import { SttDiffAssessor } from '@/services/speech';
import {
  FakePlayerRepository,
  FakeRecognizerRepository,
  FakeRecorderRepository,
  FakeTtsRepository,
} from '@/services/speech/testing/fakes';
import {
  ShadowingDependenciesProvider,
  type ShadowingDependencies,
} from '../dependencies/ShadowingDependencies';
import { InMemoryAttemptRepository } from '../repository/InMemoryAttemptRepository';
import { ShadowingScreen } from '../screens/ShadowingScreen';
import { initialShadowingState, shadowingReducer } from '../state/slice';

const SENTENCE = "The query is slow because there's no index on the foreign key column.";

async function setup(transcript: string) {
  const recognizer = new FakeRecognizerRepository(transcript);
  const deps: ShadowingDependencies = {
    decks: new SeedDeckRepository(seedDecks),
    attempts: new InMemoryAttemptRepository(),
    tts: new FakeTtsRepository(),
    recorder: new FakeRecorderRepository('/attempt-1.wav'),
    player: new FakePlayerRepository(),
    recognizer,
    assessor: new SttDiffAssessor(recognizer, defaultAliases),
    clock: () => new Date('2026-11-17T10:00:00Z'),
  };
  const store = configureStore({
    reducer: { shadowing: shadowingReducer },
    preloadedState: { shadowing: { ...initialShadowingState, deckId: 'sql' } },
  });
  await render(
    <Provider store={store}>
      <ShadowingDependenciesProvider value={deps}>
        <ShadowingScreen />
      </ShadowingDependenciesProvider>
    </Provider>,
  );
  return { deps, store, recognizer };
}

async function holdToTalk() {
  const button = await screen.findByRole('button', { name: 'Hold to talk' });
  await fireEvent(button, 'pressIn');
  await fireEvent(button, 'pressOut');
}

describe('ShadowingScreen', () => {
  it('shows the first sentence and plays it at normal and slow speed', async () => {
    const { deps } = await setup('');
    expect(await screen.findByText('Sentence 1 of 4')).toBeOnTheScreen();
    expect(screen.getByText('column.')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Play' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Slow' }));
    const tts = deps.tts as FakeTtsRepository;
    expect(tts.spoken.map(s => [s.text, s.options.rate])).toEqual([
      [SENTENCE, 1],
      [SENTENCE, 0.6],
    ]);
  });

  it('scores a correct attempt, stores it and moves to the next sentence', async () => {
    const { deps, recognizer } = await setup(SENTENCE);
    await holdToTalk();
    expect(await screen.findByText('Score 100')).toBeOnTheScreen();
    expect(recognizer.calls[0]?.hints).toEqual(
      expect.arrayContaining(['query', 'foreign key', 'column']),
    );
    expect(await deps.attempts.listByDeck('sql')).toHaveLength(1);
    await fireEvent.press(screen.getByRole('button', { name: 'Next sentence' }));
    expect(screen.getByText('Sentence 2 of 4')).toBeOnTheScreen();
    expect(screen.queryByTestId('attempt-result')).toBeNull();
  });

  it('asks to retry below 85 and plays model → me', async () => {
    const { deps } = await setup('the query is slow because');
    await holdToTalk();
    const result = await screen.findByTestId('attempt-result');
    expect(within(result).getByText(/Aim for 85/)).toBeOnTheScreen();
    expect(within(result).queryByRole('button', { name: 'Next sentence' })).toBeNull();
    await fireEvent.press(screen.getByRole('button', { name: 'Model → me' }));
    expect((deps.player as FakePlayerRepository).played).toEqual(['/attempt-1.wav']);
  });

  it('does not record without microphone permission', async () => {
    const { deps } = await setup(SENTENCE);
    (deps.recorder as FakeRecorderRepository).permission = 'denied';
    await holdToTalk();
    expect(await screen.findByText('Microphone access is needed to record.')).toBeOnTheScreen();
    expect(screen.queryByTestId('attempt-result')).toBeNull();
  });

  it('opens word details with IPA and hint on tap', async () => {
    const { deps } = await setup('');
    await fireEvent.press(await screen.findByRole('button', { name: 'column.' }));
    expect(screen.getByText('/ˈkɑːləm/')).toBeOnTheScreen();
    expect(screen.getByText('Tip: silent "n"')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Listen' }));
    expect((deps.tts as FakeTtsRepository).spoken.at(-1)).toEqual({
      text: 'column',
      options: { rate: 0.8 },
    });
  });
});
