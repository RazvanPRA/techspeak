import { countFillers } from './count-fillers.js';
import { findLongSentences } from './find-long-sentences.js';
import { wordsPerMinute } from './words-per-minute.js';

describe('countFillers', () => {
  it('counts hesitation sounds and filler words, listing each once in order', () => {
    expect(
      countFillers(
        'Um, so the uh cache is basically, um, a map. Actually it is.',
      ),
    ).toEqual({
      count: 5,
      fillers: ['um', 'uh', 'basically', 'actually'],
    });
  });

  it('counts "you know" and "I mean" as one filler each', () => {
    expect(countFillers('It is, you know, fast. I mean, really fast.')).toEqual(
      {
        count: 2,
        fillers: ['you know', 'i mean'],
      },
    );
  });

  it('counts sentence-initial "so" but not "so that"', () => {
    expect(
      countFillers('So, we cache it so that reads are fast. So we win.').count,
    ).toBe(2);
  });

  it('counts "like" only when set off by commas', () => {
    expect(
      countFillers(
        'It is, like, a queue. I like queues. Things like Redis help.',
      ),
    ).toEqual({
      count: 1,
      fillers: ['like'],
    });
  });

  it('handles drawn-out sounds and capitals', () => {
    expect(countFillers('Ummm... UHH, hmm.').fillers).toEqual([
      'um',
      'uh',
      'hmm',
    ]);
  });

  it('returns zero for a clean or empty transcript', () => {
    expect(countFillers('The event loop runs callbacks.')).toEqual({
      count: 0,
      fillers: [],
    });
    expect(countFillers('')).toEqual({ count: 0, fillers: [] });
  });
});

describe('wordsPerMinute', () => {
  it('rounds words per minute', () => {
    expect(wordsPerMinute(250, 100)).toBe(150);
    expect(wordsPerMinute(101, 60)).toBe(101);
  });

  it('returns 0 for a zero, negative or invalid duration', () => {
    expect(wordsPerMinute(10, 0)).toBe(0);
    expect(wordsPerMinute(10, -5)).toBe(0);
    expect(wordsPerMinute(10, Number.NaN)).toBe(0);
  });
});

describe('findLongSentences', () => {
  const long = Array.from({ length: 36 }, (_, i) => `word${i}`).join(' ');

  it('returns sentences longer than 35 words', () => {
    expect(findLongSentences(`Short one. ${long}. Another short one!`)).toEqual(
      [long],
    );
  });

  it('treats a transcript without punctuation as one sentence', () => {
    expect(findLongSentences(long)).toEqual([long]);
  });

  it('returns nothing for short sentences', () => {
    expect(findLongSentences('One. Two? Three!')).toEqual([]);
  });
});
