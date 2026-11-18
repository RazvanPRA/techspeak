import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { BarChart, LineChart, scalePoints } from '..';

const points = [
  { label: '11-17', value: 60 },
  { label: '11-18', value: 90 },
];

describe('scalePoints', () => {
  it('spreads points over the width and maps values to height', () => {
    expect(scalePoints(points, { width: 300, height: 100, maxValue: 100 })).toEqual([
      { key: '11-17-0', x: 0, y: 40 },
      { key: '11-18-1', x: 300, y: 10 },
    ]);
  });

  it('centres a single point and clamps values above the max', () => {
    const [p] = scalePoints([{ label: 'a', value: 150 }], { width: 300, height: 100, maxValue: 100 });
    expect(p).toEqual({ key: 'a-0', x: 150, y: 0 });
  });

  it('handles all-zero values without dividing by zero', () => {
    const scaled = scalePoints([{ label: 'a', value: 0 }, { label: 'b', value: 0 }], { width: 10, height: 10 });
    expect(scaled.map(p => p.y)).toEqual([10, 10]);
  });
});

describe('LineChart', () => {
  it('is one accessible image with the first and last values as captions', async () => {
    await render(<LineChart points={points} accessibilityLabel="Score per day: 60, 90" />);
    expect(screen.getByRole('image', { name: 'Score per day: 60, 90' })).toBeOnTheScreen();
    expect(screen.getByText('11-17: 60')).toBeOnTheScreen();
    expect(screen.getByText('11-18: 90')).toBeOnTheScreen();
  });
});

describe('BarChart', () => {
  it('labels every bar with its value', async () => {
    await render(<BarChart points={points} accessibilityLabel="Per deck" maxValue={100} />);
    expect(screen.getByRole('image', { name: 'Per deck' })).toBeOnTheScreen();
    expect(screen.getByText('11-17: 60')).toBeOnTheScreen();
  });
});
