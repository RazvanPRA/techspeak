import React from 'react';
import { configureStore } from '@reduxjs/toolkit';
import { NavigationContainer } from '@react-navigation/native';
import { render, screen } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { seedDecks } from '@/content/decks';
import {
  InMemoryAttemptRepository,
  ShadowingDependenciesProvider,
  shadowingReducer,
  type ShadowingDependencies,
} from '@/features/shadowing';
import { SeedDeckRepository } from '@/features/vocabulary';
import { defaultAliases } from '@/services/scoring';
import { SttDiffAssessor } from '@/services/speech';
import {
  FakePlayerRepository,
  FakeRecognizerRepository,
  FakeRecorderRepository,
  FakeTtsRepository,
} from '@/services/speech/testing/fakes';
import { RootTabs } from '../navigation/RootTabs';

function createDeps(): ShadowingDependencies {
  const recognizer = new FakeRecognizerRepository('');
  return {
    decks: new SeedDeckRepository(seedDecks),
    attempts: new InMemoryAttemptRepository(),
    tts: new FakeTtsRepository(),
    recorder: new FakeRecorderRepository('/attempt.wav'),
    player: new FakePlayerRepository(),
    recognizer,
    assessor: new SttDiffAssessor(recognizer, defaultAliases),
    clock: () => new Date('2026-11-17T10:00:00Z'),
  };
}

describe('RootTabs', () => {
  it('opens on the Shadowing tab with the deck picker', async () => {
    const store = configureStore({ reducer: { shadowing: shadowingReducer } });
    await render(
      <Provider store={store}>
        <ShadowingDependenciesProvider value={createDeps()}>
          <NavigationContainer>
            <RootTabs />
          </NavigationContainer>
        </ShadowingDependenciesProvider>
      </Provider>,
    );
    // The native-stack header title is not rendered in Jest, so check the deck list itself.
    expect(await screen.findByText('React & React Native')).toBeOnTheScreen();
    expect(screen.getByText('SQL & relational databases')).toBeOnTheScreen();
    expect(screen.getByText('Go (Golang)')).toBeOnTheScreen();
    expect(screen.getByText('Shadowing')).toBeOnTheScreen();
  });
});
