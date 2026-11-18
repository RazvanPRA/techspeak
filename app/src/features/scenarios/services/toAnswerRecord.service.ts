import type { ScenarioAnswerRecord } from '../model/records';
import type { AnswerResult } from '../model/types';

/** What is stored of an answer: server fluency and score when available, on-device otherwise. */
export function toAnswerRecord(result: AnswerResult, createdAt: string): ScenarioAnswerRecord {
  const fluency = result.feedback?.fluency ?? result.localFluency;
  return {
    promptId: result.prompt.id,
    deckId: result.prompt.deckId,
    durationSeconds: result.durationSeconds,
    wordsPerMinute: fluency.wordsPerMinute,
    fillers: fluency.fillerCount,
    score: result.feedback?.overallScore ?? null,
    transcript: result.transcript,
    createdAt,
  };
}
