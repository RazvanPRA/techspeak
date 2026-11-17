import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { seedDecks } from '@/content/decks';
import minimalPairs from '@/content/minimal-pairs.json';
import { InMemoryPairAttemptRepository, SeedPairRepository } from '@/features/minimal-pairs';
import { InMemoryAttemptRepository } from '@/features/shadowing';
import { InMemoryVocabularyRepository, SeedDeckRepository } from '@/features/vocabulary';
import { defaultAliases } from '@/services/scoring';
import { SttDiffAssessor } from '@/services/speech';
import {
  FakePlayerRepository,
  FakeRecognizerRepository,
  FakeRecorderRepository,
  FakeTtsRepository,
} from '@/services/speech/testing/fakes';
import type { AppDependencies } from '../dependencies';
import { FeatureProviders } from '../FeatureProviders';
import { RootTabs } from '../navigation/RootTabs';
import { createStore } from '../store';

function createDeps(): AppDependencies {
  const recognizer = new FakeRecognizerRepository('');
  const speech = {
    tts: new FakeTtsRepository(),
    recorder: new FakeRecorderRepository('/attempt.wav'),
    recognizer,
  };
  const decks = new SeedDeckRepository(seedDecks);
  const clock = () => new Date('2026-11-17T10:00:00Z');
  return {
    shadowing: {
      ...speech,
      decks,
      attempts: new InMemoryAttemptRepository(),
      player: new FakePlayerRepository(),
      assessor: new SttDiffAssessor(recognizer, defaultAliases),
      clock,
    },
    vocabulary: {
      ...speech,
      decks,
      reviews: new InMemoryVocabularyRepository(),
      aliases: defaultAliases,
      missedWords: async () => new Map(),
      clock,
    },
    minimalPairs: {
      ...speech,
      pairs: new SeedPairRepository(minimalPairs),
      attempts: new InMemoryPairAttemptRepository(),
      aliases: defaultAliases,
      clock,
      random: () => 0,
    },
  };
}

async function setup() {
  await render(
    <Provider store={createStore()}>
      <FeatureProviders deps={createDeps()}>
        <NavigationContainer>
          <RootTabs />
        </NavigationContainer>
      </FeatureProviders>
    </Provider>,
  );
}

describe('RootTabs', () => {
  it('opens on the Shadowing tab with the deck picker', async () => {
    await setup();
    // The native-stack header title is not rendered in Jest, so check the deck list itself.
    expect(await screen.findByText('React & React Native')).toBeOnTheScreen();
    expect(screen.getByText('SQL & relational databases')).toBeOnTheScreen();
    expect(screen.getByText('Go (Golang)')).toBeOnTheScreen();
  });

  it('has a tab for each feature', async () => {
    await setup();
    expect(await screen.findByText('Shadowing')).toBeOnTheScreen();
    expect(screen.getByText('Vocabulary')).toBeOnTheScreen();
    expect(screen.getByText('Minimal pairs')).toBeOnTheScreen();
  });

  it('opens the vocabulary deck filter and the minimal-pairs drill', async () => {
    await setup();
    await fireEvent.press(await screen.findByText('Vocabulary'));
    expect(await screen.findByRole('checkbox', { name: /^Weak words/ })).toBeOnTheScreen();
    await fireEvent.press(screen.getByText('Minimal pairs'));
    expect(await screen.findByText('Which word did you hear?')).toBeOnTheScreen();
  });
});
