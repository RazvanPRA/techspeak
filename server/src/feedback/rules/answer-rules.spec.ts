import { goodMetrics } from '../testing/metrics-fixture.js';
import { fluencyTip } from './fluency-tip.js';
import { pickStrength } from './pick-strength.js';
import { scoreAnswer } from './score-answer.js';

describe('scoreAnswer', () => {
  it('gives a full score to a long, well-paced, clean answer with deck terms', () => {
    expect(scoreAnswer(goodMetrics({ fillerCount: 0 }))).toBe(100);
  });

  it('scores 0 when there is no real answer', () => {
    expect(scoreAnswer(goodMetrics({ wordCount: 14 }))).toBe(0);
  });

  it('takes points off for fillers, pace, length, missing terms and long sentences', () => {
    const base = scoreAnswer(goodMetrics());
    expect(scoreAnswer(goodMetrics({ fillerCount: 20 }))).toBeLessThan(base);
    expect(scoreAnswer(goodMetrics({ wordsPerMinute: 220 }))).toBeLessThan(
      base,
    );
    expect(scoreAnswer(goodMetrics({ wordCount: 60 }))).toBeLessThan(base);
    expect(scoreAnswer(goodMetrics({ termsUsed: [] }))).toBeLessThan(base);
    expect(scoreAnswer(goodMetrics({ longSentenceCount: 2 }))).toBeLessThan(
      base,
    );
  });

  it('blends in pronunciation when Azure scores were sent', () => {
    const clean = goodMetrics({ fillerCount: 0 });
    expect(scoreAnswer({ ...clean, pronunciationAverage: 50 })).toBe(90);
  });

  it('stays within 0–100 for extreme input', () => {
    const worst = goodMetrics({
      wordCount: 15,
      wordsPerMinute: 400,
      fillerCount: 15,
      termsUsed: [],
      longSentenceCount: 9,
      pronunciationAverage: 0,
    });
    const score = scoreAnswer(worst);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });
});

describe('pickStrength', () => {
  const deckTitle = 'SQL & relational databases';

  it('praises deck vocabulary first', () => {
    expect(pickStrength(goodMetrics(), deckTitle)).toBe(
      'You used 4 key SQL & relational databases terms, which makes the answer sound precise.',
    );
  });

  it('then the pace, then the lack of fillers, then the length', () => {
    expect(pickStrength(goodMetrics({ termsUsed: [] }), deckTitle)).toMatch(
      /pace of 133 words/,
    );
    expect(
      pickStrength(
        goodMetrics({ termsUsed: [], wordsPerMinute: 90, fillerCount: 0 }),
        deckTitle,
      ),
    ).toMatch(/almost no filler/);
    expect(
      pickStrength(
        goodMetrics({ termsUsed: [], wordsPerMinute: 90, fillerCount: 30 }),
        deckTitle,
      ),
    ).toMatch(/over a minute/);
  });

  it('names one term when that is the best there is', () => {
    const m = goodMetrics({
      termsUsed: ['index'],
      wordsPerMinute: 90,
      fillerCount: 30,
      durationSeconds: 40,
    });
    expect(pickStrength(m, deckTitle)).toBe(
      'You brought in deck vocabulary such as "index".',
    );
  });

  it('explains what to try next time when there was no real answer', () => {
    expect(pickStrength(goodMetrics({ wordCount: 3 }), deckTitle)).toMatch(
      /^I heard almost nothing/,
    );
  });
});

describe('fluencyTip', () => {
  it.each([
    ['no real answer', { wordCount: 5 }, /60–120 seconds/],
    [
      'many fillers',
      { fillerCount: 20, fillers: ['basically'] },
      /Replace "basically"/,
    ],
    ['too fast', { wordsPerMinute: 190 }, /Slow down/],
    ['too slow', { wordsPerMinute: 80 }, /keep moving/],
    ['long sentences', { longSentenceCount: 1 }, /Break long sentences/],
    ['too short', { durationSeconds: 45 }, /past one minute/],
    ['all good', {}, /^Good flow/],
  ])('%s', (_label, overrides, expected) => {
    expect(fluencyTip(goodMetrics(overrides))).toMatch(expected);
  });
});
