import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { Stepper } from '..';

const props = {
  label: 'Daily goal',
  value: '18 min',
  decrementLabel: 'Less',
  incrementLabel: 'More',
};

describe('Stepper', () => {
  it('shows the label and value and reports both buttons', async () => {
    const onDecrement = jest.fn();
    const onIncrement = jest.fn();
    await render(<Stepper {...props} onDecrement={onDecrement} onIncrement={onIncrement} />);
    expect(screen.getByText('Daily goal')).toBeOnTheScreen();
    expect(screen.getByText('18 min')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Less' }));
    await fireEvent.press(screen.getByRole('button', { name: 'More' }));
    expect(onDecrement).toHaveBeenCalledTimes(1);
    expect(onIncrement).toHaveBeenCalledTimes(1);
  });

  it('disables a button at the end of the range', async () => {
    const onIncrement = jest.fn();
    await render(
      <Stepper {...props} onDecrement={jest.fn()} onIncrement={onIncrement} canIncrement={false} />,
    );
    const more = screen.getByRole('button', { name: 'More' });
    expect(more).toBeDisabled();
    await fireEvent.press(more);
    expect(onIncrement).not.toHaveBeenCalled();
  });
});
