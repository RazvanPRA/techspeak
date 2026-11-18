import success from './fixtures/azure-success.json' with { type: 'json' };
import { mapAzureResponse } from './map-azure-response.js';

describe('mapAzureResponse', () => {
  it('maps overall scores, words and phonemes', () => {
    const result = mapAzureResponse(success);
    expect(result.recognized).toBe(true);
    expect(result.transcript).toBe('Sink about the cache.');
    expect(result.scores).toEqual({
      pronunciation: 78.2,
      accuracy: 71.5,
      fluency: 88,
      completeness: 100,
      prosody: 80.4,
    });
    expect(result.words.map((w) => [w.word, w.accuracy, w.errorType])).toEqual([
      ['think', 38, 'Mispronunciation'],
      ['about', 96, 'None'],
      ['the', 0, 'Omission'],
      ['uh', 0, 'Insertion'],
      ['cache', 92, 'None'],
    ]);
    expect(result.words[0]?.phonemes[0]).toEqual({ phoneme: 'θ', accuracy: 5 });
  });

  it('reads scores nested under PronunciationAssessment', () => {
    const cache = mapAzureResponse(success).words[4];
    expect(cache?.phonemes).toEqual([
      { phoneme: 'k', accuracy: 99 },
      { phoneme: 'æ', accuracy: 85 },
      { phoneme: 'ʃ', accuracy: 93 },
    ]);
  });

  it('returns an empty, unrecognised result when nothing was heard', () => {
    const result = mapAzureResponse({
      RecognitionStatus: 'InitialSilenceTimeout',
    });
    expect(result).toEqual({
      recognized: false,
      transcript: '',
      scores: {
        pronunciation: 0,
        accuracy: 0,
        fluency: 0,
        completeness: 0,
        prosody: null,
      },
      words: [],
    });
  });

  it('treats an unknown error type as None and clamps bad scores to 0', () => {
    const result = mapAzureResponse({
      RecognitionStatus: 'Success',
      NBest: [
        {
          Display: 'x',
          Words: [{ Word: 'x', AccuracyScore: 'n/a', ErrorType: 'Weird' }],
        },
      ],
    });
    expect(result.words[0]).toEqual({
      word: 'x',
      accuracy: 0,
      errorType: 'None',
      phonemes: [],
    });
    expect(result.scores.prosody).toBeNull();
  });

  it('throws on a response that is not an Azure result', () => {
    expect(() => mapAzureResponse({ error: 'nope' })).toThrow();
  });
});
