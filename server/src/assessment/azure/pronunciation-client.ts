import type { PronunciationResult } from '../assessment.types.js';

/** Scores a 16 kHz mono WAV against the text the speaker was asked to say. */
export interface PronunciationClient {
  assess(wav: Buffer, referenceText: string): Promise<PronunciationResult>;
}

export const PRONUNCIATION_CLIENT = Symbol('PronunciationClient');
