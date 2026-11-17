import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import minimalPairs from '@/content/minimal-pairs.json';
import { defaultAliases } from '@/services/scoring';
import { type PronunciationAssessor, SttDiffAssessor } from '@/services/speech';
import {
  FakeAssessor,
  FakeRecognizerRepository,
  FakeRecorderRepository,
  FakeTtsRepository,
} from '@/services/speech/testing/fakes';
import {
  MinimalPairsDependenciesProvider,
  type MinimalPairsDependencies,
} from '../dependencies/MinimalPairsDependencies';
import { InMemoryPairAttemptRepository } from '../repository/InMemoryPairAttemptRepository';
import { SeedPairRepository } from '../repository/SeedPairRepository';
import { MinimalPairsScreen } from '../screens/MinimalPairsScreen';

async function setup(assessor?: PronunciationAssessor) {
  const recognizer = new FakeRecognizerRepository('');
  const deps: MinimalPairsDependencies = {
    pairs: new SeedPairRepository(minimalPairs),
    attempts: new InMemoryPairAttemptRepository(),
    tts: new FakeTtsRepository(),
    recorder: new FakeRecorderRepository('/pair.wav'),
    recognizer,
    assessor: assessor ?? new SttDiffAssessor(recognizer, defaultAliases),
    aliases: defaultAliases,
    clock: () => new Date('2026-11-17T10:00:00.000Z'),
    random: () => 0, // always the first available pair, side A
  };
  await render(
    <MinimalPairsDependenciesProvider value={deps}>
      <MinimalPairsScreen />
    </MinimalPairsDependenciesProvider>,
  );
  return { deps, recognizer, tts: deps.tts as FakeTtsRepository };
}

async function holdToTalk() {
  const button = await screen.findByRole('button', { name: 'Hold to talk' });
  await fireEvent(button, 'pressIn');
  await fireEvent(button, 'pressOut');
}

describe('MinimalPairsScreen — listen and pick', () => {
  it('speaks the target, scores the pick and saves it', async () => {
    const { deps, tts } = await setup();
    expect(await screen.findByText('Which word did you hear?')).toBeOnTheScreen();
    expect(tts.spoken.map(s => s.text)).toEqual(['think']);
    await fireEvent.press(screen.getByRole('button', { name: 'think' }));
    expect(screen.getByText('Correct!')).toBeOnTheScreen();
    expect(screen.getByText(/^Tip: th: tongue tip/)).toBeOnTheScreen();
    expect(screen.getByText(/1 of 1 correct/)).toBeOnTheScreen();
    expect(await deps.attempts.listRecent(5)).toEqual([
      {
        pairId: 'think-sink',
        sound: 'θ-s',
        mode: 'listen',
        correct: true,
        createdAt: '2026-11-17T10:00:00.000Z',
      },
    ]);
  });

  it('moves to a different pair and reports a wrong pick', async () => {
    const { deps, tts } = await setup();
    await fireEvent.press(await screen.findByRole('button', { name: 'think' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Next pair' }));
    expect(tts.spoken.map(s => s.text)).toEqual(['think', 'thick']);
    await fireEvent.press(screen.getByRole('button', { name: 'sick' }));
    expect(screen.getByText('Not quite. It was “thick”.')).toBeOnTheScreen();
    expect(screen.getByText(/1 of 2 correct/)).toBeOnTheScreen();
    const [latest] = await deps.attempts.listRecent(1);
    expect(latest).toMatchObject({ pairId: 'thick-sick', correct: false });
  });

  it('counts only the first pick of a round', async () => {
    const { deps } = await setup();
    await fireEvent.press(await screen.findByRole('button', { name: 'sink' }));
    expect(screen.getByRole('button', { name: 'think' })).toBeDisabled();
    expect(await deps.attempts.listRecent(5)).toHaveLength(1);
  });
});

describe('MinimalPairsScreen — say it', () => {
  it('rejects the paired word, accepts the target, and saves every try', async () => {
    const { deps, recognizer } = await setup();
    await fireEvent.press(await screen.findByRole('tab', { name: 'Say it' }));
    expect(await screen.findByRole('header', { name: 'Say “think”' })).toBeOnTheScreen();
    expect(screen.getByText('Not “sink”')).toBeOnTheScreen();

    recognizer.transcript = 'sink';
    await holdToTalk();
    expect(await screen.findByText('That sounded like “sink”.')).toBeOnTheScreen();
    expect(recognizer.calls[0]?.hints).toEqual(['think', 'sink']);

    recognizer.transcript = 'Think.';
    await holdToTalk();
    expect(await screen.findByText('Clear “think”. Nice!')).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Hold to talk' })).toBeNull();

    const tries = await deps.attempts.listRecent(5);
    expect(tries.map(a => [a.mode, a.correct])).toEqual([
      ['say', true],
      ['say', false],
    ]);
  });
});

describe('MinimalPairsScreen — say it with Azure scores', () => {
  const scored = (accuracy: number) =>
    new FakeAssessor({
      transcript: 'think',
      words: [{ kind: 'ok', targetIndex: 0, word: 'think' }],
      score: accuracy,
      details: {
        accuracy,
        fluency: 100,
        completeness: 100,
        prosody: null,
        words: [{ targetIndex: 0, word: 'think', accuracy, phonemes: [] }],
      },
    });

  it('sends the target word as reference text and passes at 80+', async () => {
    const assessor = scored(91);
    await setup(assessor);
    await fireEvent.press(await screen.findByRole('tab', { name: 'Say it' }));
    await holdToTalk();
    expect(await screen.findByText('Clear “think”. Nice!')).toBeOnTheScreen();
    expect(assessor.inputs[0]).toMatchObject({ referenceText: 'think', targetWords: ['think'] });
  });

  it('reports a recognised but weak word with its score', async () => {
    const { deps } = await setup(scored(62));
    await fireEvent.press(await screen.findByRole('tab', { name: 'Say it' }));
    await holdToTalk();
    expect(await screen.findByText('“think” scored 62/100. Aim for 80.')).toBeOnTheScreen();
    const [latest] = await deps.attempts.listRecent(1);
    expect(latest).toMatchObject({ mode: 'say', correct: false });
  });
});
