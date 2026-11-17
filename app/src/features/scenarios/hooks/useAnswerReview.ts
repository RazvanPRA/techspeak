import { useCallback, useMemo } from 'react';
import { errorMessage } from '@/shared/utils';
import { useScenariosDependencies } from '../dependencies/ScenariosDependencies';
import { HINT_TERMS } from '../model/constants';
import type { AnswerResult, ScenarioPrompt } from '../model/types';
import { summarizeFluency } from '../services/summarizeFluency.service';

/** Recording → Whisper transcript → server feedback. Without the server, a local summary only. */
export function useAnswerReview(prompt: ScenarioPrompt) {
  const { recognizer, feedback, decks } = useScenariosDependencies();
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
      try {
        return { ...base, feedback: await feedback.review(request), feedbackError: null };
      } catch (e) {
        return { ...base, feedback: null, feedbackError: errorMessage(e) };
      }
    },
    [recognizer, feedback, hints, prompt],
  );
}
