import { z } from 'zod';
import { ERROR_TYPES } from '../assessment.types.js';

/**
 * Azure returns the scores either flat on the object (REST short audio) or nested under
 * `PronunciationAssessment` (Speech SDK JSON). Both shapes are accepted.
 */
function flattenAssessment(value: unknown): unknown {
  if (value === null || typeof value !== 'object') return value;
  const nested = (value as { PronunciationAssessment?: unknown })
    .PronunciationAssessment;
  return nested && typeof nested === 'object' ? { ...value, ...nested } : value;
}

const score = z.number().min(0).max(100).catch(0);

const AzurePhonemeSchema = z.preprocess(
  flattenAssessment,
  z.object({ Phoneme: z.string(), AccuracyScore: score }),
);

const AzureWordSchema = z.preprocess(
  flattenAssessment,
  z.object({
    Word: z.string(),
    AccuracyScore: score,
    ErrorType: z.enum(ERROR_TYPES).catch('None'),
    Phonemes: z.array(AzurePhonemeSchema).default([]),
  }),
);

const AzureNBestSchema = z.preprocess(
  flattenAssessment,
  z.object({
    Display: z.string().default(''),
    PronScore: score,
    AccuracyScore: score,
    FluencyScore: score,
    CompletenessScore: score,
    ProsodyScore: z.number().min(0).max(100).optional(),
    Words: z.array(AzureWordSchema).default([]),
  }),
);

export const AzureResponseSchema = z.object({
  RecognitionStatus: z.string(),
  NBest: z.array(AzureNBestSchema).default([]),
});

export type AzureResponse = z.infer<typeof AzureResponseSchema>;
