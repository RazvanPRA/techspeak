import { countFillers } from '../services/countFillers.service';
import { formatDuration } from '@/shared/utils';
import { summarizeFluency } from '../services/summarizeFluency.service';
import { wordsPerMinute } from '../services/wordsPerMinute.service';

describe('countFillers', () => {
  it('counts hesitation sounds and filler words, listing each once in order', () => {
    expect(countFillers('Um, so the uh cache is basically, um, a map. Actually it is.')).toEqual({
      count: 5,
      fillers: ['um', 'uh', 'basically', 'actually'],
    });
  });

  it('counts sentence-initial "so", "like" set off by commas, "you know" and "I mean"', () => {
    expect(countFillers('So, it is, like, fast, you know. I mean, really.')).toEqual({
      count: 4,
      fillers: ['so', 'like', 'you know', 'i mean'],
    });
  });

  it('does not count "so that", "I like" or "things like"', () => {
    expect(countFillers('We cache it so that I like it. Things like Redis help.').count).toBe(0);
  });

  it('returns zero for an empty transcript', () => {
    expect(countFillers('')).toEqual({ count: 0, fillers: [] });
  });
});

describe('wordsPerMinute', () => {
  it('rounds words per minute', () => {
    expect(wordsPerMinute(250, 100)).toBe(150);
  });

  it('returns 0 for a zero, negative or invalid duration', () => {
    expect(wordsPerMinute(10, 0)).toBe(0);
    expect(wordsPerMinute(10, -1)).toBe(0);
    expect(wordsPerMinute(10, Number.NaN)).toBe(0);
  });
});

describe('summarizeFluency', () => {
  it('measures pace and fillers of a transcript', () => {
    expect(summarizeFluency('Um, the event loop runs callbacks.', 3)).toEqual({
      wordCount: 6,
      wordsPerMinute: 120,
      fillerCount: 1,
      fillers: ['um'],
    });
  });

  it('handles silence', () => {
    expect(summarizeFluency('   ', 10)).toEqual({
      wordCount: 0,
      wordsPerMinute: 0,
      fillerCount: 0,
      fillers: [],
    });
  });
});

describe('formatDuration', () => {
  it.each([
    [0, '0:00'],
    [5.7, '0:05'],
    [65, '1:05'],
    [120, '2:00'],
    [-3, '0:00'],
  ])('%s s → %s', (seconds, text) => {
    expect(formatDuration(seconds)).toBe(text);
  });
});
