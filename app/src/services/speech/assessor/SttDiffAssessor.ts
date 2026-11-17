import {
  type AliasMap,
  diffWords,
  normalizeTranscript,
  scoreAttempt,
} from '@/services/scoring';
import type {
  AssessInput,
  Assessment,
  PronunciationAssessor,
  RecognizerRepository,
} from '../model/types';

/**
 * Milestone 1 assessor: speech-to-text + word diff. Lenient by design (Whisper
 * auto-corrects toward plausible words); real phoneme scores come from Azure in milestone 3.
 */
export class SttDiffAssessor implements PronunciationAssessor {
  constructor(
    private readonly recognizer: RecognizerRepository,
    private readonly aliases: AliasMap,
  ) {}

  async assess({ targetWords, audioPath, hints }: AssessInput): Promise<Assessment> {
    const transcript = await this.recognizer.transcribe(audioPath, hints);
    const spoken = normalizeTranscript(transcript, this.aliases);
    const words = diffWords([...targetWords], spoken);
    return { transcript, words, score: scoreAttempt(words) };
  }
}
