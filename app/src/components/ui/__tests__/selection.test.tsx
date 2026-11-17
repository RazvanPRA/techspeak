import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { EmptyState, SegmentedControl, SelectableRow } from '..';

describe('EmptyState', () => {
  it('shows its message', async () => {
    await render(<EmptyState message="Nothing to review" />);
    expect(screen.getByText('Nothing to review')).toBeOnTheScreen();
  });
});

describe('SelectableRow', () => {
  it('is a checkbox with its checked state and caption in the label', async () => {
    const onPress = jest.fn();
    await render(<SelectableRow label="SQL" caption="12 terms" selected onPress={onPress} />);
    const row = screen.getByRole('checkbox', { name: 'SQL, 12 terms' });
    expect(row).toBeChecked();
    await fireEvent.press(row);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('is unchecked when not selected', async () => {
    await render(<SelectableRow label="Go" selected={false} onPress={jest.fn()} />);
    expect(screen.getByRole('checkbox', { name: 'Go' })).not.toBeChecked();
  });
});

describe('SegmentedControl', () => {
  const segments = [
    { key: 'listen', label: 'Listen' },
    { key: 'say', label: 'Say' },
  ] as const;

  it('marks the selected segment and reports the pressed one', async () => {
    const onChange = jest.fn();
    await render(<SegmentedControl segments={segments} selected="listen" onChange={onChange} />);
    expect(screen.getByRole('tab', { name: 'Listen' })).toBeSelected();
    expect(screen.getByRole('tab', { name: 'Say' })).not.toBeSelected();
    await fireEvent.press(screen.getByRole('tab', { name: 'Say' }));
    expect(onChange).toHaveBeenCalledWith('say');
  });
});
