import type { HttpClient } from '@/services/api';
import type { AssessInput, Assessment, PronunciationAssessor } from '../model/types';
import { type AssessmentResponse, AssessmentResponseSchema } from './assessmentResponse.schema';
import { mapScoredWords } from './mapScoredWords.service';

type FormPoster = Pick<HttpClient, 'postForm'>;

/** React Native's FormData takes a `{ uri, name, type }` file part; the cast is RN-specific. */
function audioForm(audioPath: string, referenceText: string): FormData {
  const form = new FormData();
  form.append('referenceText', referenceText);
  const uri = audioPath.startsWith('file://') ? audioPath : `file://${audioPath}`;
  form.append('audio', { uri, name: 'attempt.wav', type: 'audio/wav' } as unknown as Blob);
  return form;
}

function toAssessment(targets: readonly string[], reply: AssessmentResponse): Assessment {
  const { words, scored } = mapScoredWords(targets, reply.recognized ? reply.words : []);
  const { scores } = reply;
  return {
    transcript: reply.transcript,
    words,
    score: Math.round(scores.pronunciation),
    details: {
      accuracy: scores.accuracy,
      fluency: scores.fluency,
      completeness: scores.completeness,
      prosody: scores.prosody,
      words: scored,
    },
  };
}

/** Phoneme-level scoring by Azure Speech, through the TechSpeak server (no key in the app). */
export class AzurePronunciationAssessor implements PronunciationAssessor {
  constructor(private readonly http: FormPoster) {}

  async assess({ targetWords, audioPath, referenceText }: AssessInput): Promise<Assessment> {
    const text = referenceText ?? targetWords.join(' ');
    const form = audioForm(audioPath, text);
    const reply = await this.http.postForm('/assessment', form, AssessmentResponseSchema);
    return toAssessment(targetWords, reply);
  }
}
