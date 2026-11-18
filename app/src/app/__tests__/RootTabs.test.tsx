import { fireEvent, screen } from '@testing-library/react-native';
import { renderApp as setup } from '../testing/renderApp';

describe('RootTabs', () => {
  it('opens on Today with the plan and the streak', async () => {
    await setup();
    expect(await screen.findByText('Start a streak today')).toBeOnTheScreen();
    expect(await screen.findByText('Plan for today · 18 min', { exact: false })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Start the session' })).toBeOnTheScreen();
  });

  it('opens the Shadowing tab with the deck picker', async () => {
    await setup();
    await fireEvent.press(await screen.findByText('Shadowing'));
    // The native-stack header title is not rendered in Jest, so check the deck list itself.
    expect(await screen.findByText('React & React Native')).toBeOnTheScreen();
    expect(screen.getByText('SQL & relational databases')).toBeOnTheScreen();
    expect(screen.getByText('Go (Golang)')).toBeOnTheScreen();
  });

  it('has a tab for each feature', async () => {
    await setup();
    expect(await screen.findByText('Shadowing')).toBeOnTheScreen();
    expect(screen.getAllByText('Today').length).toBeGreaterThan(0);
    expect(screen.getByText('Progress')).toBeOnTheScreen();
    expect(screen.getByText('Vocabulary')).toBeOnTheScreen();
    expect(screen.getByText('Minimal pairs')).toBeOnTheScreen();
    expect(screen.getByText('Scenarios')).toBeOnTheScreen();
  });

  it('opens the scenario prompt list', async () => {
    await setup();
    await fireEvent.press(await screen.findByText('Scenarios'));
    expect(
      await screen.findByRole('button', { name: 'How would you investigate a slow query?' }),
    ).toBeOnTheScreen();
  });

  it('opens the vocabulary deck filter and the minimal-pairs drill', async () => {
    await setup();
    await fireEvent.press(await screen.findByText('Vocabulary'));
    expect(await screen.findByRole('checkbox', { name: /^Weak words/ })).toBeOnTheScreen();
    await fireEvent.press(screen.getByText('Minimal pairs'));
    expect(await screen.findByText('Which word did you hear?')).toBeOnTheScreen();
  });
});

describe('Progress tab', () => {
  it('shows the empty-state hints before any practice', async () => {
    await setup();
    await fireEvent.press(await screen.findByText('Progress'));
    expect(await screen.findByText('No weak sounds yet. Drill minimal pairs to find them.')).toBeOnTheScreen();
    expect(screen.getByText('0 terms reviewed 3 weeks or more ahead')).toBeOnTheScreen();
  });
});
