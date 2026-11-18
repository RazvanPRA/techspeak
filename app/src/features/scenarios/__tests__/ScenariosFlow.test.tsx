import { fireEvent, screen } from '@testing-library/react-native';
import {
  fakeScenariosDependencies,
  renderScenarios,
  waitSeconds as wait,
} from '../testing/renderScenarios';
import { FakeFeedbackRepository, sampleFeedback } from '../testing/fixtures';

const PROMPT = 'How would you investigate a slow query?';
const ANSWER = 'Um, first I would run explain analyze on the query and check the index.';

async function setup(feedback = new FakeFeedbackRepository()) {
  const deps = { ...fakeScenariosDependencies(ANSWER), feedback };
  await renderScenarios(deps);
  return deps;
}

async function openPromptAndStart() {
  await fireEvent.press(await screen.findByRole('button', { name: PROMPT }));
  await fireEvent.press(await screen.findByRole('button', { name: 'Start answering' }));
}

beforeEach(() => jest.useFakeTimers({ now: new Date('2026-11-17T10:00:00Z') }));
afterEach(() => jest.useRealTimers());

describe('Scenarios', () => {
  it('times the answer, sends the transcript and shows the feedback', async () => {
    const { feedback, recognizer, recorder, answers } = await setup();
    await openPromptAndStart();
    expect(recorder.isRecording).toBe(true);
    expect(screen.getByText('Keep going: aim for at least 1 minute.')).toBeOnTheScreen();

    await wait(65);
    expect(screen.getByText('1:05 / 2:00')).toBeOnTheScreen();
    expect(screen.getByText('Good length. Wrap up before 2:00.')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Stop and get feedback' }));

    expect(await screen.findByText('Score 72')).toBeOnTheScreen();
    expect(recognizer.calls[0]?.hints).toEqual(expect.arrayContaining(['query']));
    expect(feedback.requests).toEqual([
      { prompt: PROMPT, deckId: 'sql', transcript: ANSWER, durationSeconds: 65 },
    ]);
    expect(screen.getByText(sampleFeedback.strength)).toBeOnTheScreen();
    expect(screen.getByText(ANSWER)).toBeOnTheScreen();
    expect(screen.getByText('128 words per minute (aim for 110–170)')).toBeOnTheScreen();
    expect(screen.getByText('"KWEE-ree"')).toBeOnTheScreen();
    expect(screen.getByText('Try next time: transaction')).toBeOnTheScreen();
    expect(screen.getByText('“Add an index on the foreign key.”')).toBeOnTheScreen();
    expect(screen.queryByTestId('better-way')).toBeNull();
    expect(answers.records).toEqual([
      expect.objectContaining({ promptId: 'sql-2', score: 72, wordsPerMinute: 128, fillers: 2 }),
    ]);
  });

  it('stops by itself at two minutes', async () => {
    const { feedback, recorder } = await setup();
    await openPromptAndStart();
    await wait(121);
    expect(await screen.findByText('Score 72')).toBeOnTheScreen();
    expect(recorder.isRecording).toBe(false);
    expect(feedback.requests[0]?.durationSeconds).toBe(120);
  });

  it('shows an on-device summary when the server cannot be reached', async () => {
    await setup(new FakeFeedbackRepository(new Error('Could not reach the TechSpeak server')));
    await openPromptAndStart();
    await wait(30);
    await fireEvent.press(screen.getByRole('button', { name: 'Stop and get feedback' }));
    expect(
      await screen.findByText(
        'No feedback from the server (Could not reach the TechSpeak server). Here is an on-device summary.',
      ),
    ).toBeOnTheScreen();
    // 14 words in 30 s, one "um"
    expect(screen.getByText('28 words per minute (aim for 110–170)')).toBeOnTheScreen();
    expect(screen.getByText('1 filler words: um')).toBeOnTheScreen();
  });

  it('shows "a better way to say it" once the server returns corrections', async () => {
    const withCorrections = {
      ...sampleFeedback,
      corrections: [
        { said: 'I check index', better: 'I check the index', type: 'grammar' as const, why: 'Article.' },
      ],
    };
    await setup(new FakeFeedbackRepository(withCorrections));
    await openPromptAndStart();
    await wait(61);
    await fireEvent.press(screen.getByRole('button', { name: 'Stop and get feedback' }));
    expect(await screen.findByTestId('better-way')).toBeOnTheScreen();
    expect(screen.getByText('“I check index” → “I check the index”')).toBeOnTheScreen();
  });

  it('does not record without microphone permission', async () => {
    const { recorder } = await setup();
    recorder.permission = 'denied';
    await openPromptAndStart();
    expect(await screen.findByText('Microphone access is needed to record.')).toBeOnTheScreen();
    expect(recorder.isRecording).toBe(false);
  });
});
