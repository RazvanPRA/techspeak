import { compareTalks, fillersPerMinute } from '../services/compareTalks.service';

const talk = (wordsPerMinute: number, fillers: number, durationSeconds = 180) => ({
  audioPath: '/talk.wav',
  durationSeconds,
  transcript: '',
  wordsPerMinute,
  fillers,
  createdAt: '2026-11-18T10:00:00.000Z',
});

describe('compareTalks', () => {
  it('reports pace and filler changes against the baseline', () => {
    expect(compareTalks(talk(110, 12), talk(132, 3))).toEqual({
      wordsPerMinute: 22,
      fillersPerMinute: -3,
    });
  });

  it('compares fillers per minute, so talks of different length are fair', () => {
    expect(fillersPerMinute(talk(120, 6, 120))).toBe(3);
    expect(fillersPerMinute(talk(120, 6, 0))).toBe(0);
  });
});
