import { useCallback, useEffect, useRef, useState } from 'react';
import { useMicPermission } from '@/services/speech';
import { t } from '@/shared/i18n';
import { errorMessage } from '@/shared/utils';
import { useScenariosDependencies } from '../dependencies/ScenariosDependencies';
import { MAX_ANSWER_SECONDS } from '../model/constants';
import type { AnswerPhase } from '../model/types';
import { useAnswerTimer } from './useAnswerTimer';

type OnRecorded = (audioPath: string, durationSeconds: number) => Promise<void>;

/** Tap to start, tap to stop (auto-stops at 2 minutes); hands the WAV and its length on. */
export function useAnswerRecording(onRecorded: OnRecorded) {
  const { recorder, clock } = useScenariosDependencies();
  const { isPermitted } = useMicPermission(recorder);
  const [phase, setPhase] = useState<AnswerPhase>('idle');
  const [error, setError] = useState<string | null>(null);
  const phaseRef = useRef<AnswerPhase>('idle');
  const finishRef = useRef<() => void>(() => undefined);
  const onLimit = useCallback(() => finishRef.current(), []);
  const timer = useAnswerTimer({ clock, maxSeconds: MAX_ANSWER_SECONDS, onLimit });

  const move = useCallback((next: AnswerPhase) => {
    phaseRef.current = next;
    setPhase(next);
  }, []);

  const start = useCallback(async () => {
    if (phaseRef.current !== 'idle') return;
    setError(null);
    if (!(await isPermitted())) {
      setError(t('speech.micDenied'));
      return;
    }
    try {
      await recorder.start();
      timer.start();
      move('recording');
    } catch (e) {
      setError(errorMessage(e));
    }
  }, [isPermitted, recorder, timer, move]);

  const finish = useCallback(async () => {
    if (phaseRef.current !== 'recording') return;
    move('processing');
    const seconds = timer.stop();
    try {
      await onRecorded(await recorder.stop(), seconds);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      move('idle');
    }
  }, [onRecorded, recorder, timer, move]);
  finishRef.current = () => {
    finish();
  };

  // Leaving the screen mid-answer must not leave the microphone on.
  useEffect(
    () => () => {
      if (phaseRef.current === 'recording') recorder.stop().catch(() => undefined);
    },
    [recorder],
  );

  return { phase, error, elapsed: timer.elapsed, start, finish };
}
