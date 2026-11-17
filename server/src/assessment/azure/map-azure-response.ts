import type { PronunciationResult } from '../assessment.types.js';
import { AzureResponseSchema } from './azure-response.schema.js';

const NOTHING_HEARD: PronunciationResult = {
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
};

/** Validates Azure's detailed JSON and maps the best hypothesis to a PronunciationResult. */
export function mapAzureResponse(raw: unknown): PronunciationResult {
  const response = AzureResponseSchema.parse(raw);
  const best = response.NBest[0];
  if (response.RecognitionStatus !== 'Success' || !best) return NOTHING_HEARD;
  return {
    recognized: true,
    transcript: best.Display,
    scores: {
      pronunciation: best.PronScore,
      accuracy: best.AccuracyScore,
      fluency: best.FluencyScore,
      completeness: best.CompletenessScore,
      prosody: best.ProsodyScore ?? null,
    },
    words: best.Words.map((w) => ({
      word: w.Word,
      accuracy: w.AccuracyScore,
      errorType: w.ErrorType,
      phonemes: w.Phonemes.map((p) => ({
        phoneme: p.Phoneme,
        accuracy: p.AccuracyScore,
      })),
    })),
  };
}
