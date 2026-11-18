import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { act, render } from '@testing-library/react-native';
import { seedDecks } from '@/content/decks';
import prompts from '@/content/prompts.json';
import { SeedDeckRepository } from '@/features/vocabulary';
import {
  FakePlayerRepository,
  FakeRecognizerRepository,
  FakeRecorderRepository,
  FakeRecordingArchive,
} from '@/services/speech/testing/fakes';
import {
  ScenariosDependenciesProvider,
  type ScenariosDependencies,
} from '../dependencies/ScenariosDependencies';
import { ScenariosNavigator } from '../navigation/ScenariosNavigator';
import {
  InMemoryScenarioAnswerRepository,
  InMemoryTalkRepository,
} from '../repository/InMemoryRecordRepositories';
import { SeedPromptRepository } from '../repository/SeedPromptRepository';
import { FakeFeedbackRepository } from './fixtures';

/** Fakes for every scenarios dependency; tests change the ones they care about. */
export function fakeScenariosDependencies(transcript: string) {
  return {
    prompts: new SeedPromptRepository(prompts),
    feedback: new FakeFeedbackRepository(),
    decks: new SeedDeckRepository(seedDecks),
    answers: new InMemoryScenarioAnswerRepository(),
    talks: new InMemoryTalkRepository(),
    archive: new FakeRecordingArchive(),
    recorder: new FakeRecorderRepository('/answer.wav'),
    recognizer: new FakeRecognizerRepository(transcript),
    player: new FakePlayerRepository(),
    clock: () => new Date(),
    random: () => 0,
  } satisfies ScenariosDependencies;
}

export async function renderScenarios(deps: ScenariosDependencies) {
  await render(
    <ScenariosDependenciesProvider value={deps}>
      <NavigationContainer>
        <ScenariosNavigator />
      </NavigationContainer>
    </ScenariosDependenciesProvider>,
  );
}

/** Moves fake timers (and the answer timer) forward. */
export async function waitSeconds(seconds: number) {
  await act(async () => {
    jest.advanceTimersByTime(seconds * 1000);
  });
}
