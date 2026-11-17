import { isCorrectPick, judgeSaid } from '../services/judgeRound.service';
import type { Round } from '../model/types';
import { makePair } from '../testing/fixtures';

const pair = makePair('think', 'sink');
const round: Round = { pair, side: 'a', target: pair.a, other: pair.b };

describe('isCorrectPick', () => {
  it('is true only for the spoken side', () => {
    expect(isCorrectPick(round, 'a')).toBe(true);
    expect(isCorrectPick(round, 'b')).toBe(false);
  });
});

describe('judgeSaid', () => {
  it('is correct when the target is heard and its pair is not', () => {
    expect(judgeSaid(round, 'Think.', {})).toBe('correct');
    expect(judgeSaid(round, 'I said think', {})).toBe('correct');
  });

  it('is confused when only the other word is heard', () => {
    expect(judgeSaid(round, 'sink', {})).toBe('confused');
  });

  it('is unclear when both or neither are heard', () => {
    expect(judgeSaid(round, 'think sink', {})).toBe('unclear');
    expect(judgeSaid(round, 'thing', {})).toBe('unclear');
    expect(judgeSaid(round, '', {})).toBe('unclear');
  });

  it('applies spoken aliases', () => {
    expect(judgeSaid(round, 'thinc', { thinc: 'think' })).toBe('correct');
  });
});
