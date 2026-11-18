import { act, fireEvent, screen } from '@testing-library/react-native';
import { InMemoryReminderRepository } from '@/services/reminders';
import { createTestDependencies, renderApp } from '../testing/renderApp';

beforeEach(() => jest.useFakeTimers({ now: new Date(2026, 10, 18, 9, 0) }));
afterEach(() => jest.useRealTimers());

function setup() {
  const deps = createTestDependencies();
  deps.session.clock = () => new Date();
  return deps;
}

const press = async (name: string) => fireEvent.press(await screen.findByRole('button', { name }));

describe('Daily session', () => {
  it('runs every block, then shows the summary and starts the streak', async () => {
    const deps = setup();
    await renderApp(deps);
    await press('Start the session');

    expect(await screen.findByText('1 of 4 · Minimal pairs')).toBeOnTheScreen();
    expect(screen.getByText('Which word did you hear?')).toBeOnTheScreen();
    await act(async () => {
      jest.advanceTimersByTime(3 * 60 * 1000);
    });
    expect(screen.getByText(/Time is up/)).toBeOnTheScreen();

    await press('Next');
    expect(await screen.findByText('2 of 4 · Shadowing')).toBeOnTheScreen();
    await press('Next');
    expect(await screen.findByText('3 of 4 · Vocabulary review')).toBeOnTheScreen();
    await press('Skip');
    expect(await screen.findByText('4 of 4 · Scenario')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Start answering' })).toBeOnTheScreen();
    await press('Finish');

    expect(await screen.findByText('Well done!')).toBeOnTheScreen();
    expect(screen.getByText('Done: Minimal pairs, Shadowing, Scenario')).toBeOnTheScreen();
    expect(screen.getByText('Skipped: Vocabulary review')).toBeOnTheScreen();
    expect(deps.session.settings.get().streak).toEqual({ lastDay: '2026-11-18', count: 1 });

    await press('Back to today');
    expect(await screen.findByText('Streak: 1 day')).toBeOnTheScreen();
  });

  it('does not count a session where every block was skipped', async () => {
    const deps = setup();
    await renderApp(deps);
    await press('Start the session');
    await press('Skip');
    await press('Skip');
    await press('Skip');
    await press('Skip');
    expect(await screen.findByText('Every block was skipped.')).toBeOnTheScreen();
    expect(deps.session.settings.get().streak.count).toBe(0);
  });
});

describe('Settings', () => {
  async function openSettings(deps = setup()) {
    await renderApp(deps);
    await fireEvent.press(await screen.findByRole('button', { name: 'Settings' }));
    return deps;
  }

  it('changes the daily goal, which resizes the plan', async () => {
    const deps = await openSettings();
    await press('Longer');
    await press('Longer');
    expect(deps.session.settings.get().dailyGoalMinutes).toBe(20);
    await press('Slower');
    expect(deps.session.settings.get().speechRate).toBe(0.9);
  });

  it('schedules the reminder when turned on and moves it', async () => {
    const deps = await openSettings();
    const reminders = deps.session.reminders as InMemoryReminderRepository;
    await fireEvent.press(await screen.findByRole('tab', { name: 'On' }));
    expect(reminders.scheduled?.time).toEqual(expect.objectContaining({ hour: 19, minute: 0 }));
    await press('5 minutes later');
    await press('One hour earlier');
    expect(reminders.scheduled?.time).toEqual(expect.objectContaining({ hour: 18, minute: 5 }));
    await fireEvent.press(screen.getByRole('tab', { name: 'Off' }));
    expect(reminders.scheduled).toBeNull();
  });

  it('explains when notifications are not allowed', async () => {
    const deps = setup();
    deps.session.reminders = new InMemoryReminderRepository('denied');
    await openSettings(deps);
    await fireEvent.press(await screen.findByRole('tab', { name: 'On' }));
    expect(
      await screen.findByText(
        'Allow notifications for TechSpeak in the system settings to get the reminder.',
      ),
    ).toBeOnTheScreen();
    expect(deps.session.settings.get().reminder.enabled).toBe(false);
  });
});
