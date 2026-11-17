import {
  isCorrectPick,
  judgeAssessment,
  judgeSaid,
} from '../services/judgeRound.service';
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

describe('judgeAssessment', () => {
  const assessment = (transcript: string, accuracy?: number) => ({
    transcript,
    words: [],
    score: accuracy ?? 0,
    ...(accuracy === undefined
      ? {}
      : {
          details: {
            accuracy,
            fluency: 100,
            completeness: 100,
            prosody: null,
            words: [{ targetIndex: 0, word: 'think', accuracy, phonemes: [] }],
          },
        }),
  });

  it('uses the transcript when there are no word scores', () => {
    expect(judgeAssessment(round, assessment('sink'), {})).toEqual({
      verdict: 'confused',
      transcript: 'sink',
      accuracy: null,
    });
  });

  it('passes at 80+ accuracy, even if speech-to-text heard something else', () => {
    expect(judgeAssessment(round, assessment('thing', 80.4), {}).verdict).toBe(
      'correct',
    );
  });

  it('is weak below 80, or confused if the other word was heard', () => {
    expect(judgeAssessment(round, assessment('think', 55), {})).toEqual({
      verdict: 'weak',
      transcript: 'think',
      accuracy: 55,
    });
    expect(judgeAssessment(round, assessment('sink', 30), {}).verdict).toBe(
      'confused',
    );
  });
});
