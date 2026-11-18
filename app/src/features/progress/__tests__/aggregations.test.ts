import { averageScoreByDay } from '../services/averageScoreByDay.service';
import { averageScoreByDeck } from '../services/averageScoreByDeck.service';
import { countMasteredWords } from '../services/countMasteredWords.service';
import { fluencyTrend } from '../services/fluencyTrend.service';

// Local noon, so the local day is the same in every timezone.
const at = (day: string) => new Date(`${day}T12:00:00`).toISOString();

describe('averageScoreByDay', () => {
  it('averages per local day, oldest first, rounded', () => {
    const attempts = [
      { createdAt: at('2026-11-18'), deckId: 'sql', score: 90 },
      { createdAt: at('2026-11-17'), deckId: 'go', score: 70 },
      { createdAt: at('2026-11-18'), deckId: 'go', score: 81 },
    ];
    expect(averageScoreByDay(attempts)).toEqual([
      { day: '2026-11-17', value: 70, count: 1 },
      { day: '2026-11-18', value: 86, count: 2 },
    ]);
  });

  it('is empty without attempts', () => {
    expect(averageScoreByDay([])).toEqual([]);
  });
});

describe('averageScoreByDeck', () => {
  it('lists the weakest deck first', () => {
    const attempts = [
      { createdAt: at('2026-11-18'), deckId: 'sql', score: 90 },
      { createdAt: at('2026-11-18'), deckId: 'go', score: 60 },
      { createdAt: at('2026-11-18'), deckId: 'go', score: 70 },
    ];
    expect(averageScoreByDeck(attempts)).toEqual([
      { deckId: 'go', value: 65, count: 2 },
      { deckId: 'sql', value: 90, count: 1 },
    ]);
  });
});

describe('countMasteredWords', () => {
  it('counts terms whose review interval reached 21 days', () => {
    expect(countMasteredWords([{ interval: 1 }, { interval: 21 }, { interval: 40 }])).toBe(2);
    expect(countMasteredWords([])).toBe(0);
  });
});

describe('fluencyTrend', () => {
  it('averages words per minute and fillers per minute per day', () => {
    const answers = [
      { createdAt: at('2026-11-17'), wordsPerMinute: 120, fillers: 4, durationSeconds: 120 },
      { createdAt: at('2026-11-17'), wordsPerMinute: 140, fillers: 0, durationSeconds: 60 },
      { createdAt: at('2026-11-18'), wordsPerMinute: 150, fillers: 1, durationSeconds: 60 },
    ];
    expect(fluencyTrend(answers)).toEqual([
      { day: '2026-11-17', wordsPerMinute: 130, fillersPerMinute: 1.3 },
      { day: '2026-11-18', wordsPerMinute: 150, fillersPerMinute: 1 },
    ]);
  });

  it('skips answers with no duration', () => {
    const answers = [{ createdAt: at('2026-11-17'), wordsPerMinute: 0, fillers: 2, durationSeconds: 0 }];
    expect(fluencyTrend(answers)).toEqual([]);
  });
});
