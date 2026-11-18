// Test-only: the whole app wired with fakes and in-memory stores.
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { render } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { seedDecks } from '@/content/decks';
import minimalPairs from '@/content/minimal-pairs.json';
import prompts from '@/content/prompts.json';
import { InMemoryPairAttemptRepository, SeedPairRepository } from '@/features/minimal-pairs';
import {
  InMemoryScenarioAnswerRepository,
  InMemoryTalkRepository,
  SeedPromptRepository,
  UnavailableFeedbackRepository,
} from '@/features/scenarios';
import { InMemoryAttemptRepository } from '@/features/shadowing';
import { InMemoryVocabularyRepository, SeedDeckRepository } from '@/features/vocabulary';
import { InMemoryReminderRepository } from '@/services/reminders';
import { defaultAliases } from '@/services/scoring';
import { InMemoryKeyValueStore, KeyValueSettingsRepository } from '@/services/settings';
import { SttDiffAssessor } from '@/services/speech';
import {
  FakePlayerRepository,
  FakeRecognizerRepository,
  FakeRecorderRepository,
  FakeRecordingArchive,
  FakeTtsRepository,
} from '@/services/speech/testing/fakes';
import { createProgressSources, createSessionSources } from '../crossFeatureSources';
import type { AppDependencies } from '../dependencies';
import { FeatureProviders } from '../FeatureProviders';
import { RootTabs } from '../navigation/RootTabs';
import { createStore } from '../store';

/** Every feature wired with fakes and in-memory stores. */
export function createTestDependencies(): AppDependencies {
  const recognizer = new FakeRecognizerRepository('');
  const speech = {
    tts: new FakeTtsRepository(),
    recorder: new FakeRecorderRepository('/attempt.wav'),
    recognizer,
  };
  const decks = new SeedDeckRepository(seedDecks);
  const clock = () => new Date('2026-11-17T10:00:00Z');
  const attempts = new InMemoryAttemptRepository();
  const pairAttempts = new InMemoryPairAttemptRepository();
  const reviews = new InMemoryVocabularyRepository();
  const answers = new InMemoryScenarioAnswerRepository();
  const progress = createProgressSources({ attempts, pairAttempts, reviews, answers });
  return {
    shadowing: {
      ...speech,
      decks,
      attempts,
      player: new FakePlayerRepository(),
      assessor: new SttDiffAssessor(recognizer, defaultAliases),
      clock,
    },
    vocabulary: {
      ...speech,
      decks,
      reviews,
      aliases: defaultAliases,
      missedWords: async () => new Map(),
      clock,
    },
    minimalPairs: {
      ...speech,
      assessor: new SttDiffAssessor(recognizer, defaultAliases),
      pairs: new SeedPairRepository(minimalPairs),
      attempts: pairAttempts,
      aliases: defaultAliases,
      clock,
      random: () => 0,
    },
    scenarios: {
      recorder: speech.recorder,
      recognizer,
      decks,
      prompts: new SeedPromptRepository(prompts),
      feedback: new UnavailableFeedbackRepository(),
      answers,
      talks: new InMemoryTalkRepository(),
      archive: new FakeRecordingArchive(),
      player: new FakePlayerRepository(),
      clock,
      random: () => 0,
    },
    session: {
      settings: new KeyValueSettingsRepository(new InMemoryKeyValueStore()),
      reminders: new InMemoryReminderRepository(),
      ...createSessionSources(progress, { decks, reviews }, clock),
      shadowingDeckIds: ['react-rn', 'sql', 'go'],
      promptIds: ['sql-1', 'sql-2'],
      clock,
      random: () => 0,
    },
    progress,
  };
}

/** Renders the tab app around the given (or fresh) dependencies. */
export async function renderApp(deps: AppDependencies = createTestDependencies()) {
  await render(
    <Provider store={createStore()}>
      <FeatureProviders deps={deps}>
        <NavigationContainer>
          <RootTabs />
        </NavigationContainer>
      </FeatureProviders>
    </Provider>,
  );
}
