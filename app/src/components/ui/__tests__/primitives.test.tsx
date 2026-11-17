import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { AppText, Button, Card } from '..';

describe('Button', () => {
  it('renders its label as an accessible button and handles press', async () => {
    const onPress = jest.fn();
    await render(<Button label="Play" onPress={onPress} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Play' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('forwards press-in and press-out (hold to talk)', async () => {
    const onPressIn = jest.fn();
    const onPressOut = jest.fn();
    await render(<Button label="Hold" onPressIn={onPressIn} onPressOut={onPressOut} />);
    const button = screen.getByRole('button', { name: 'Hold' });
    await fireEvent(button, 'pressIn');
    await fireEvent(button, 'pressOut');
    expect(onPressIn).toHaveBeenCalled();
    expect(onPressOut).toHaveBeenCalled();
  });

  it('exposes the disabled state and ignores presses', async () => {
    const onPress = jest.fn();
    await render(<Button label="Next" onPress={onPress} disabled />);
    const button = screen.getByRole('button', { name: 'Next' });
    expect(button).toBeDisabled();
    await fireEvent.press(button);
    expect(onPress).not.toHaveBeenCalled();
  });
});

describe('AppText and Card', () => {
  it('renders text inside a card', async () => {
    await render(
      <Card testID="card">
        <AppText variant="title" accessibilityRole="header">
          Decks
        </AppText>
      </Card>,
    );
    expect(screen.getByTestId('card')).toBeOnTheScreen();
    expect(screen.getByRole('header', { name: 'Decks' })).toBeOnTheScreen();
  });
});
