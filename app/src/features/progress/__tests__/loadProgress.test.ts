import type { ProgressSources } from '../model/sources';
import { loadProgress, loadWeakSounds } from '../services/loadProgress.service';

const at = (day: string) => new Date(`${day}T12:00:00`).toISOString();

function sources(): ProgressSources {
  return {
    shadowingAttempts: async () => [
      {
        createdAt: at('2026-11-18'),
        deckId: 'sql',
        score: 80,
        phonemes: [
          { phoneme: 'θ', accuracy: 20 },
          { phoneme: 'θ', accuracy: 30 },
        ],
      },
    ],
    pairResults: async () => [{ sound: 'θ-s', correct: true }],
    reviewIntervals: async () => [{ interval: 30 }, { interval: 2 }],
    scenarioAnswers: async () => [
      { createdAt: at('2026-11-18'), wordsPerMinute: 125, fillers: 2, durationSeconds: 60 },
    ],
  };
}

describe('loadProgress', () => {
  it('combines every source into the progress data', async () => {
    expect(await loadProgress(sources())).toEqual({
      scoreByDay: [{ day: '2026-11-18', value: 80, count: 1 }],
      scoreByDeck: [{ deckId: 'sql', value: 80, count: 1 }],
      masteredWords: 1,
      weakSounds: [{ sound: 'θ-s', errorRate: 2 / 3, samples: 3 }],
      fluency: [{ day: '2026-11-18', wordsPerMinute: 125, fillersPerMinute: 2 }],
    });
  });

  it('rejects when a source fails, so the screen can show an error', async () => {
    const failing = { ...sources(), reviewIntervals: () => Promise.reject(new Error('db')) };
    await expect(loadProgress(failing)).rejects.toThrow('db');
  });
});

describe('loadWeakSounds', () => {
  it('uses pair drills and Azure phonemes only', async () => {
    expect((await loadWeakSounds(sources())).map(s => s.sound)).toEqual(['θ-s']);
  });
});
