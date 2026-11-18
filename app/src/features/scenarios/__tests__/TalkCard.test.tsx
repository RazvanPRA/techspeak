import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { TalkCard } from '../components/TalkCard';

const talk = {
  audioPath: '/talks/1.wav',
  durationSeconds: 180,
  transcript: 'about indexes',
  wordsPerMinute: 130,
  fillers: 3,
  createdAt: '2026-11-18T09:00:00.000Z',
};

describe('TalkCard', () => {
  it('plays the recording', async () => {
    const onPlay = jest.fn();
    await render(<TalkCard title="Baseline" talk={talk} onPlay={onPlay} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Play' }));
    expect(onPlay).toHaveBeenCalledWith('/talks/1.wav');
  });

  it('has no play button for a talk restored without its audio', async () => {
    await render(<TalkCard title="Baseline" talk={{ ...talk, audioPath: '' }} onPlay={jest.fn()} />);
    expect(screen.getByText('Baseline')).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Play' })).toBeNull();
  });
});
