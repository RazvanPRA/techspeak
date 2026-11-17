import { defaultAliases } from '@/services/scoring';
import { SttDiffAssessor } from '../assessor/SttDiffAssessor';
import { FakeRecognizerRepository } from '../testing/fakes';

const target = ['we', 'use', 'postgres', 'with', 'json'];

describe('SttDiffAssessor', () => {
  it('scores a perfect transcript as 100, mapping aliases', async () => {
    const recognizer = new FakeRecognizerRepository('We use Post gress with Jason.');
    const result = await new SttDiffAssessor(recognizer, defaultAliases).assess({
      targetWords: target,
      audioPath: '/a.wav',
    });
    expect(result.score).toBe(100);
    expect(result.transcript).toBe('We use Post gress with Jason.');
  });

  it('marks wrong and missing words', async () => {
    const recognizer = new FakeRecognizerRepository('we use progress');
    const { words, score } = await new SttDiffAssessor(recognizer, {}).assess({
      targetWords: target,
      audioPath: '/a.wav',
    });
    expect(words.map(w => w.kind)).toEqual(['ok', 'ok', 'wrong', 'missing', 'missing']);
    expect(score).toBe(40);
  });

  it('passes the audio path and hints to the recognizer', async () => {
    const recognizer = new FakeRecognizerRepository('');
    await new SttDiffAssessor(recognizer, {}).assess({
      targetWords: target,
      audioPath: '/b.wav',
      hints: ['Postgres', 'JSON'],
    });
    expect(recognizer.calls).toEqual([{ path: '/b.wav', hints: ['Postgres', 'JSON'] }]);
  });

  it('scores silence as 0', async () => {
    const result = await new SttDiffAssessor(new FakeRecognizerRepository(''), {}).assess({
      targetWords: target,
      audioPath: '/a.wav',
    });
    expect(result.score).toBe(0);
  });
});
