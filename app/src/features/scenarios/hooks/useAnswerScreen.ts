import { useCallback } from 'react';
import { useSpeechModel } from '@/services/speech';
import { useScenariosDependencies } from '../dependencies/ScenariosDependencies';
import type { AnswerResult, ScenarioPrompt } from '../model/types';
import { useAnswerRecording } from './useAnswerRecording';
import { useAnswerReview } from './useAnswerReview';

/** Wires the answer screen: speech model, timed recording, review, then `onDone`. */
export function useAnswerScreen(prompt: ScenarioPrompt, onDone: (result: AnswerResult) => void) {
  const { recognizer } = useScenariosDependencies();
  const model = useSpeechModel(recognizer);
  const review = useAnswerReview(prompt);
  const onRecorded = useCallback(
    async (audioPath: string, seconds: number) => onDone(await review(audioPath, seconds)),
    [review, onDone],
  );
  const recording = useAnswerRecording(onRecorded);
  const { start: startRecording, finish } = recording;
  const start = useCallback(() => {
    startRecording();
  }, [startRecording]);
  const stop = useCallback(() => {
    finish();
  }, [finish]);
  return {
    model,
    phase: recording.phase,
    elapsed: recording.elapsed,
    error: recording.error,
    canStart: model.status === 'ready',
    start,
    stop,
  };
}
