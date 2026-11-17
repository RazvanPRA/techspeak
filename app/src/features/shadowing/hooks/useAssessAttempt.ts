import { useCallback } from 'react';
import type { SentenceToken } from '../model/types';
import { useShadowingDependencies } from '../dependencies/ShadowingDependencies';
import { selectDeckId, selectSentenceIndex } from '../state/selectors';
import { attemptCompleted } from '../state/slice';
import { useShadowingDispatch, useShadowingSelector } from '../state/hooks';

/** Scores a recording against the current sentence, stores it and publishes the result. */
export function useAssessAttempt(tokens: readonly SentenceToken[], hints: readonly string[]) {
  const { assessor, attempts, clock } = useShadowingDependencies();
  const dispatch = useShadowingDispatch();
  const deckId = useShadowingSelector(selectDeckId);
  const sentenceIndex = useShadowingSelector(selectSentenceIndex);

  return useCallback(
    async (audioPath: string) => {
      const assessment = await assessor.assess({
        targetWords: tokens.map(t => t.normalized),
        audioPath,
        hints,
      });
      const result = { ...assessment, audioPath };
      dispatch(attemptCompleted(result));
      if (deckId) {
        await attempts.save({ ...result, deckId, sentenceIndex, createdAt: clock().toISOString() });
      }
    },
    [assessor, attempts, clock, dispatch, deckId, sentenceIndex, tokens, hints],
  );
}
