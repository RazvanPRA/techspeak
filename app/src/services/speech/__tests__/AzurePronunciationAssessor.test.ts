import { HttpClient } from '@/services/api';
import { AzurePronunciationAssessor } from '../assessor/AzurePronunciationAssessor';

// Jest runs Node's FormData (which has .get); React Native's FormData type does not declare it.
const field = (form: FormData | undefined, name: string): unknown =>
  (form as unknown as { get(key: string): unknown } | undefined)?.get(name);

function serverReplying(body: unknown, status = 200) {
  const calls: Array<{ url: string; form: FormData }> = [];
  const fetchFn = (async (url: string, init: RequestInit) => {
    calls.push({ url, form: init.body as FormData });
    return { ok: status === 200, status, json: async () => body };
  }) as unknown as typeof fetch;
  const http = new HttpClient({ baseUrl: 'http://localhost:3000', apiKey: 'k', fetchFn });
  return { assessor: new AzurePronunciationAssessor(http), calls };
}

const reply = {
  recognized: true,
  transcript: 'Sink about it.',
  scores: { pronunciation: 71.6, accuracy: 65, fluency: 90, completeness: 100, prosody: 80 },
  words: [
    { word: 'think', accuracy: 30, errorType: 'Mispronunciation', phonemes: [{ phoneme: 'θ', accuracy: 5 }] },
    { word: 'about', accuracy: 95, errorType: 'None', phonemes: [] },
    { word: 'it', accuracy: 92, errorType: 'None', phonemes: [] },
  ],
};

describe('AzurePronunciationAssessor', () => {
  it('uploads the WAV with the written sentence and maps the scores', async () => {
    const { assessor, calls } = serverReplying(reply);
    const result = await assessor.assess({
      targetWords: ['think', 'about', 'it'],
      audioPath: '/data/attempt.wav',
      referenceText: 'Think about it.',
    });

    expect(calls[0]?.url).toBe('http://localhost:3000/assessment');
    expect(field(calls[0]?.form, 'referenceText')).toBe('Think about it.');
    expect(field(calls[0]?.form, 'audio')).not.toBeNull();
    expect(result.score).toBe(72);
    expect(result.transcript).toBe('Sink about it.');
    expect(result.words.map(w => w.kind)).toEqual(['wrong', 'ok', 'ok']);
    expect(result.details?.words[0]).toEqual({
      targetIndex: 0,
      word: 'think',
      accuracy: 30,
      phonemes: [{ phoneme: 'θ', accuracy: 5 }],
    });
  });

  it('joins the target words when there is no reference text', async () => {
    const { assessor, calls } = serverReplying(reply);
    await assessor.assess({ targetWords: ['think', 'about', 'it'], audioPath: 'file:///a.wav' });
    expect(field(calls[0]?.form, 'referenceText')).toBe('think about it');
  });

  it('marks every word missing when Azure heard nothing', async () => {
    const { assessor } = serverReplying({ ...reply, recognized: false, transcript: '', words: [] });
    const result = await assessor.assess({ targetWords: ['go'], audioPath: '/a.wav' });
    expect(result.words).toEqual([{ kind: 'missing', targetIndex: 0, word: 'go' }]);
  });

  it('fails when the server is not configured for Azure (so the fallback takes over)', async () => {
    const { assessor } = serverReplying({ message: 'not configured' }, 503);
    await expect(assessor.assess({ targetWords: ['go'], audioPath: '/a.wav' })).rejects.toMatchObject({
      status: 503,
    });
  });
});
