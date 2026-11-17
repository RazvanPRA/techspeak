import { FallbackAssessor } from '../assessor/FallbackAssessor';
import type { AssessInput, Assessment, PronunciationAssessor } from '../model/types';

const input: AssessInput = { targetWords: ['cache'], audioPath: '/a.wav' };
const result = (score: number): Assessment => ({ transcript: 'cache', words: [], score });

class StubAssessor implements PronunciationAssessor {
  calls = 0;
  constructor(private readonly outcome: Assessment | Error) {}
  async assess(): Promise<Assessment> {
    this.calls += 1;
    if (this.outcome instanceof Error) throw this.outcome;
    return this.outcome;
  }
}

describe('FallbackAssessor', () => {
  it('uses the primary assessor when it works', async () => {
    const primary = new StubAssessor(result(90));
    const fallback = new StubAssessor(result(10));
    await expect(new FallbackAssessor(primary, fallback).assess(input)).resolves.toEqual(result(90));
    expect(fallback.calls).toBe(0);
  });

  it('falls back when the primary assessor fails', async () => {
    const onFallback = jest.fn();
    const primary = new StubAssessor(new Error('server unreachable'));
    const fallback = new StubAssessor(result(70));
    const assessor = new FallbackAssessor(primary, fallback, onFallback);
    await expect(assessor.assess(input)).resolves.toEqual(result(70));
    expect(onFallback).toHaveBeenCalledWith(expect.objectContaining({ message: 'server unreachable' }));
  });

  it('reports the fallback error when both fail', async () => {
    const assessor = new FallbackAssessor(
      new StubAssessor(new Error('server down')),
      new StubAssessor(new Error('model missing')),
    );
    await expect(assessor.assess(input)).rejects.toThrow('model missing');
  });
});
