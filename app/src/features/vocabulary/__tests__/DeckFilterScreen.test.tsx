import React from 'react';
import { configureStore } from '@reduxjs/toolkit';
import { NavigationContainer } from '@react-navigation/native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { seedDecks } from '@/content/decks';
import { defaultAliases } from '@/services/scoring';
import {
  FakeRecognizerRepository,
  FakeRecorderRepository,
  FakeTtsRepository,
} from '@/services/speech/testing/fakes';
import { VocabularyDependenciesProvider } from '../dependencies/VocabularyDependencies';
import { VocabularyNavigator } from '../navigation/VocabularyNavigator';
import { InMemoryVocabularyRepository } from '../repository/InMemoryVocabularyRepository';
import { SeedDeckRepository } from '../repository/SeedDeckRepository';
import { vocabularyReducer } from '../state/slice';
import { makeState } from '../testing/fixtures';

async function setup() {
  const store = configureStore({ reducer: { vocabulary: vocabularyReducer } });
  const reviews = new InMemoryVocabularyRepository([makeState('go', 'goroutine', { lapses: 3 })]);
  await render(
    <Provider store={store}>
      <VocabularyDependenciesProvider
        value={{
          decks: new SeedDeckRepository(seedDecks),
          reviews,
          tts: new FakeTtsRepository(),
          recorder: new FakeRecorderRepository(),
          recognizer: new FakeRecognizerRepository(''),
          aliases: defaultAliases,
          missedWords: async () => new Map(),
          clock: () => new Date('2026-11-17T10:00:00.000Z'),
        }}>
        <NavigationContainer>
          <VocabularyNavigator />
        </NavigationContainer>
      </VocabularyDependenciesProvider>
    </Provider>,
  );
}

describe('DeckFilterScreen', () => {
  it('lists all 13 decks plus weak words, and needs a choice before starting', async () => {
    await setup();
    expect(await screen.findByRole('checkbox', { name: /^Weak words/ })).toBeOnTheScreen();
    expect(screen.getByRole('checkbox', { name: /^SQL & relational databases/ })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Start review' })).toBeDisabled();
  });

  it('starts a review of the chosen deck', async () => {
    await setup();
    const sql = await screen.findByRole('checkbox', { name: /^SQL & relational databases/ });
    await fireEvent.press(sql);
    expect(sql).toBeChecked();
    await fireEvent.press(screen.getByRole('button', { name: 'Start review' }));
    expect(await screen.findByRole('header', { name: 'SQL' })).toBeOnTheScreen();
  });

  it('starts the weak-words deck', async () => {
    await setup();
    await fireEvent.press(await screen.findByRole('checkbox', { name: /^Weak words/ }));
    await fireEvent.press(screen.getByRole('button', { name: 'Start review' }));
    expect(await screen.findByRole('header', { name: 'goroutine' })).toBeOnTheScreen();
    expect(screen.getByText('Card 1 of 1')).toBeOnTheScreen();
  });
});
