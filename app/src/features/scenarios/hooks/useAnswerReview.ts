import { useCallback, useMemo } from 'react';
import { errorMessage } from '@/shared/utils';
import { useScenariosDependencies } from '../dependencies/ScenariosDependencies';
import { HINT_TERMS } from '../model/constants';
import type { AnswerResult, ScenarioPrompt } from '../model/types';
import { summarizeFluency } from '../services/summarizeFluency.service';
import { toAnswerRecord } from '../services/toAnswerRecord.service';

/** Recording → Whisper transcript → server feedback (local summary without it) → stored answer. */
export function useAnswerReview(prompt: ScenarioPrompt) {
  const { recognizer, feedback, decks, answers, clock } = useScenariosDependencies();
  const hints = useMemo(
    () => (decks.getDeck(prompt.deckId)?.terms ?? []).slice(0, HINT_TERMS).map(t => t.term),
    [decks, prompt.deckId],
  );

  return useCallback(
    async (audioPath: string, durationSeconds: number): Promise<AnswerResult> => {
      const transcript = (await recognizer.transcribe(audioPath, hints)).trim();
      const base = {
        prompt,
        transcript,
        durationSeconds,
        localFluency: summarizeFluency(transcript, durationSeconds),
      };
      const request = { prompt: prompt.text, deckId: prompt.deckId, transcript, durationSeconds };
      let result: AnswerResult;
      try {
        result = { ...base, feedback: await feedback.review(request), feedbackError: null };
      } catch (e) {
        result = { ...base, feedback: null, feedbackError: errorMessage(e) };
      }
      // Losing one trend point must not hide the feedback.
      await answers.save(toAnswerRecord(result, clock().toISOString())).catch(() => undefined);
      return result;
    },
    [recognizer, feedback, answers, clock, hints, prompt],
  );
}
