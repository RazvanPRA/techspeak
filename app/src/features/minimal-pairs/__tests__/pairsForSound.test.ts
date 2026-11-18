import { pairsForSound } from '../services/pairsForSound.service';
import { makePair } from '../testing/fixtures';

const pairs = [makePair('think', 'sink'), makePair('west', 'vest', 'w-v'), makePair('wine', 'vine', 'w-v')];

describe('pairsForSound', () => {
  it('keeps only the pairs of the focus sound', () => {
    expect(pairsForSound(pairs, 'w-v').map(p => p.id)).toEqual(['west-vest', 'wine-vine']);
  });

  it('uses every pair without a focus, or when no pair drills that sound', () => {
    expect(pairsForSound(pairs, null)).toHaveLength(3);
    expect(pairsForSound(pairs, 'æ-e')).toHaveLength(3);
  });
});
