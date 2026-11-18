import { fireEvent, screen } from '@testing-library/react-native';
import { sampleFeedback } from '../testing/fixtures';
import {
  fakeScenariosDependencies,
  renderScenarios,
  waitSeconds,
} from '../testing/renderScenarios';

const ANSWER = 'Um, so, I would add an index and check the plan.';

beforeEach(() => jest.useFakeTimers({ now: new Date('2026-11-18T10:00:00Z') }));
afterEach(() => jest.useRealTimers());

async function answerFor(seconds: number) {
  await fireEvent.press(await screen.findByRole('button', { name: 'Start answering' }));
  await waitSeconds(seconds);
  await fireEvent.press(screen.getByRole('button', { name: 'Stop and get feedback' }));
}

describe('Mock interview', () => {
  it('asks 5 questions from the chosen deck and summarises what to improve', async () => {
    const deps = fakeScenariosDependencies(ANSWER);
    deps.feedback.reply = { ...sampleFeedback, fluency: { ...sampleFeedback.fluency, fillerCount: 6 } };
    await renderScenarios(deps);
    await fireEvent.press(await screen.findByRole('button', { name: 'Mock interview: 5 questions in a row' }));
    await fireEvent.press(await screen.findByRole('checkbox', { name: 'SQL' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Start the interview' }));

    for (const n of [1, 2, 3, 4, 5]) {
      expect(await screen.findByText(`Question ${n} of 5`)).toBeOnTheScreen();
      await answerFor(45);
    }

    expect(await screen.findByText('Interview summary', { exact: false })).toBeOnTheScreen();
    expect(deps.feedback.requests).toHaveLength(5);
    // The SQL deck has 2 prompts; the other 3 questions are topped up from other decks.
    expect(deps.feedback.requests.slice(0, 2).every(r => r.deckId === 'sql')).toBe(true);
    expect(new Set(deps.feedback.requests.map(r => r.prompt)).size).toBe(5);
    expect(screen.getByText('1. Give longer answers')).toBeOnTheScreen();
    expect(screen.getByText('2. Cut the filler words')).toBeOnTheScreen();
    expect(screen.getByText('3. Practise these words')).toBeOnTheScreen();
    expect(deps.answers.records).toHaveLength(5);
  });
});

describe('Talk check', () => {
  it('stores the first talk as the baseline and compares the next one with it', async () => {
    const deps = fakeScenariosDependencies(ANSWER);
    await renderScenarios(deps);
    await fireEvent.press(await screen.findByRole('button', { name: 'Talk check: record a 3-minute talk' }));

    await fireEvent.press(await screen.findByRole('button', { name: 'Start the talk' }));
    await waitSeconds(181);
    expect(await screen.findByText('Baseline (first talk)')).toBeOnTheScreen();
    expect(deps.talks.records[0]).toEqual(
      expect.objectContaining({ audioPath: '/kept/answer.wav', durationSeconds: 180 }),
    );

    deps.recognizer.transcript = 'I would add an index and then check the plan again.';
    await fireEvent.press(screen.getByRole('button', { name: 'Start the talk' }));
    await waitSeconds(60);
    await fireEvent.press(screen.getByRole('button', { name: 'Stop and save' }));
    expect(await screen.findByText('Latest talk')).toBeOnTheScreen();
    expect(screen.getByText(/^Since the baseline:/)).toBeOnTheScreen();

    await fireEvent.press(screen.getAllByRole('button', { name: 'Play' })[0]!);
    expect(deps.player.played).toEqual(['/kept/answer.wav']);
  });
});
