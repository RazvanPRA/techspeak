import { useCallback, useState } from 'react';
import { useSpeak, useSpeechModel } from '@/services/speech';
import { errorMessage } from '@/shared/utils';
import { TERM_RATE } from '../model/constants';
import { reviewKey } from '../model/reviewKey';
import type { Grade } from '../model/types';
import { useVocabularyDependencies } from '../dependencies/VocabularyDependencies';
import { useReviewQueue } from './useReviewQueue';
import { useSayItCheck } from './useSayItCheck';

/** Wires the review screen: the queue, "say it aloud", reveal, self-grading and listening. */
export function useReviewScreen() {
  const { tts, recognizer } = useVocabularyDependencies();
  const queue = useReviewQueue();
  const model = useSpeechModel(recognizer);
  const speech = useSpeak(tts);
  const term = queue.current?.term.term ?? null;
  const key = queue.current ? reviewKey(queue.current.deckId, term ?? '') : null;
  const sayIt = useSayItCheck({ term, cardKey: key, beforeRecord: speech.stop });
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const revealed = sayIt.outcome.kind !== 'idle' || (key !== null && revealedKey === key);
  const reveal = useCallback(() => setRevealedKey(key), [key]);

  const { complete } = queue;
  const grade = useCallback(
    (value: Grade) => {
      setSaveError(null);
      complete(value).catch(e => setSaveError(errorMessage(e)));
    },
    [complete],
  );
  const { outcome } = sayIt;
  const next = useCallback(() => {
    if (outcome.kind === 'recognised') grade(outcome.grade);
  }, [outcome, grade]);
  const { speak } = speech;
  const listen = useCallback(() => {
    if (term) speak(term, TERM_RATE);
  }, [speak, term]);
  const { stop: stopRecord } = sayIt;
  const stopRecording = useCallback(() => {
    stopRecord();
  }, [stopRecord]);

  return {
    queue,
    model,
    revealed,
    outcome,
    record: { phase: sayIt.phase, start: sayIt.start, stop: stopRecording },
    actions: { onReveal: reveal, onGrade: grade, onNext: next },
    listen,
    error: sayIt.error ?? speech.error ?? saveError,
  };
}
