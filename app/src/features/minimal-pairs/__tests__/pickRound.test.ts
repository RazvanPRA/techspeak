import { pickRound } from '../services/pickRound.service';
import { makePair, sequence } from '../testing/fixtures';

const pairs = [makePair('think', 'sink'), makePair('west', 'vest', 'w-v'), makePair('ship', 'sheep', 'ɪ-iː')];

describe('pickRound', () => {
  it('picks the pair and side from the random source', () => {
    const round = pickRound(pairs, sequence(0.5, 0.9));
    expect(round.pair.id).toBe('west-vest');
    expect(round.side).toBe('b');
    expect(round.target.word).toBe('vest');
    expect(round.other.word).toBe('west');
  });

  it('uses side a for a low random value', () => {
    const round = pickRound(pairs, sequence(0, 0.1));
    expect(round).toMatchObject({ side: 'a', target: { word: 'think' }, other: { word: 'sink' } });
  });

  it('handles a random value just below 1', () => {
    expect(pickRound(pairs, sequence(0.9999, 0.9999)).pair.id).toBe('ship-sheep');
  });

  it('never repeats the previous pair when there is a choice', () => {
    const round = pickRound(pairs, sequence(0, 0), 'think-sink');
    expect(round.pair.id).not.toBe('think-sink');
  });

  it('repeats the only pair when there is no choice', () => {
    expect(pickRound([pairs[0]!], sequence(0, 0), 'think-sink').pair.id).toBe('think-sink');
  });

  it('throws for an empty list', () => {
    expect(() => pickRound([], Math.random)).toThrow(/no minimal pairs/i);
  });

  it('covers both sides and every pair over many rounds', () => {
    const seen = new Set<string>();
    for (let i = 0; i < 200; i++) {
      const round = pickRound(pairs, Math.random);
      seen.add(`${round.pair.id}:${round.side}`);
    }
    expect(seen.size).toBe(6);
  });
});
