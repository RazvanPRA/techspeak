import React from 'react';
import { configureStore } from '@reduxjs/toolkit';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { seedDecks } from '@/content/decks';
import { MIGRATIONS, runMigrations } from '@/services/db';
import { NodeSqliteExecutor } from '@/services/db/testing/NodeSqliteExecutor';
import { defaultAliases } from '@/services/scoring';
import {
  FakeRecognizerRepository,
  FakeRecorderRepository,
  FakeTtsRepository,
} from '@/services/speech/testing/fakes';
import {
  VocabularyDependenciesProvider,
  type VocabularyDependencies,
} from '../dependencies/VocabularyDependencies';
import { SeedDeckRepository } from '../repository/SeedDeckRepository';
import { SqliteVocabularyRepository } from '../repository/SqliteVocabularyRepository';
import type { VocabularyRepository } from '../repository/VocabularyRepository';
import { ReviewScreen } from '../screens/ReviewScreen';
import { vocabularyReducer } from '../state/slice';

const NOW = new Date('2026-11-17T10:00:00.000Z');

async function sqliteRepo(): Promise<VocabularyRepository> {
  const db = new NodeSqliteExecutor();
  await runMigrations(db, MIGRATIONS);
  return new SqliteVocabularyRepository(db);
}

async function setup(transcript: string, reviews: VocabularyRepository) {
  const recognizer = new FakeRecognizerRepository(transcript);
  const deps: VocabularyDependencies = {
    decks: new SeedDeckRepository(seedDecks),
    reviews,
    tts: new FakeTtsRepository(),
    recorder: new FakeRecorderRepository('/term.wav'),
    recognizer,
    aliases: defaultAliases,
    missedWords: async () => new Map(),
    clock: () => NOW,
  };
  const store = configureStore({
    reducer: { vocabulary: vocabularyReducer },
    preloadedState: { vocabulary: { selection: { kind: 'decks' as const, deckIds: ['sql'] } } },
  });
  const view = await render(
    <Provider store={store}>
      <VocabularyDependenciesProvider value={deps}>
        <ReviewScreen />
      </VocabularyDependenciesProvider>
    </Provider>,
  );
  return { deps, recognizer, view };
}

async function sayIt() {
  const button = await screen.findByRole('button', { name: 'Hold to talk' });
  await fireEvent(button, 'pressIn');
  await fireEvent(button, 'pressOut');
}

describe('ReviewScreen', () => {
  it('passes a recognised term with grade 5 and moves on', async () => {
    const reviews = await sqliteRepo();
    const { recognizer } = await setup('sequel', reviews);
    expect(await screen.findByRole('header', { name: 'SQL' })).toBeOnTheScreen();
    expect(screen.getByText('Card 1 of 10')).toBeOnTheScreen();
    await sayIt();
    expect(await screen.findByText('Recognised! Well said.')).toBeOnTheScreen();
    expect(recognizer.calls[0]?.hints).toEqual(['SQL']);
    await fireEvent.press(screen.getByRole('button', { name: 'Next card' }));
    expect(await screen.findByText('Card 2 of 10')).toBeOnTheScreen();
    const [saved] = await reviews.listStates(['sql']);
    expect(saved).toMatchObject({ term: 'SQL', repetitions: 1, interval: 1, ease: 2.6 });
  });

  it('reveals the answer when not recognised and lets me grade myself', async () => {
    const reviews = await sqliteRepo();
    await setup('curry', reviews);
    await sayIt();
    expect(await screen.findByText('Not recognised. I heard: “curry”')).toBeOnTheScreen();
    expect(screen.getByText('Trap: both accepted')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Again' }));
    expect(await screen.findByText('Card 2 of 10')).toBeOnTheScreen();
    const [saved] = await reviews.listStates(['sql']);
    expect(saved).toMatchObject({ term: 'SQL', repetitions: 0, lapses: 1 });
  });

  it('"Show answer" reveals pronunciation help without recording', async () => {
    await setup('', await sqliteRepo());
    await screen.findByRole('header', { name: 'SQL' });
    expect(screen.queryByText('Trap: both accepted')).toBeNull();
    await fireEvent.press(screen.getByRole('button', { name: 'Show answer' }));
    expect(screen.getByText('Trap: both accepted')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Good' })).toBeOnTheScreen();
  });

  it('keeps due dates: a reviewed card is not shown again in the next session', async () => {
    const reviews = await sqliteRepo();
    const first = await setup('sequel', reviews);
    await sayIt();
    await fireEvent.press(await screen.findByRole('button', { name: 'Next card' }));
    await screen.findByText('Card 2 of 10');
    await first.view.unmount();
    await setup('', reviews);
    expect(await screen.findByText('Card 1 of 10')).toBeOnTheScreen();
    expect(screen.queryByRole('header', { name: 'SQL' })).toBeNull();
  });

  it('says when there is nothing to review', async () => {
    const reviews = await sqliteRepo();
    const recognizer = new FakeRecognizerRepository('');
    const store = configureStore({ reducer: { vocabulary: vocabularyReducer } });
    const deps: VocabularyDependencies = {
      decks: new SeedDeckRepository(seedDecks),
      reviews,
      tts: new FakeTtsRepository(),
      recorder: new FakeRecorderRepository(),
      recognizer,
      aliases: defaultAliases,
      missedWords: async () => new Map(),
      clock: () => NOW,
    };
    await render(
      <Provider store={store}>
        <VocabularyDependenciesProvider value={deps}>
          <ReviewScreen />
        </VocabularyDependenciesProvider>
      </Provider>,
    );
    expect(await screen.findByText('Nothing to review in these decks right now.')).toBeOnTheScreen();
  });
});
