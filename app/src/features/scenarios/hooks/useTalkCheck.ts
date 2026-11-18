import { useCallback, useEffect, useState } from 'react';
import { useSpeechModel } from '@/services/speech';
import { errorMessage } from '@/shared/utils';
import { useScenariosDependencies } from '../dependencies/ScenariosDependencies';
import { TALK_SECONDS } from '../model/constants';
import type { TalkRecord } from '../model/records';
import { summarizeFluency } from '../services/summarizeFluency.service';
import { useAnswerRecording } from './useAnswerRecording';

/** The 3-minute talk check: record, transcribe, keep the audio, compare with the first talk. */
export function useTalkCheck() {
  const { talks, recognizer, archive, player, clock } = useScenariosDependencies();
  const model = useSpeechModel(recognizer);
  const [list, setList] = useState<TalkRecord[]>([]);
  const [playError, setPlayError] = useState<string | null>(null);

  const reload = useCallback(() => talks.list().then(setList), [talks]);
  useEffect(() => {
    reload().catch(e => setPlayError(errorMessage(e)));
  }, [reload]);

  const onRecorded = useCallback(
    async (audioPath: string, durationSeconds: number) => {
      const transcript = (await recognizer.transcribe(audioPath)).trim();
      const fluency = summarizeFluency(transcript, durationSeconds);
      await talks.save({
        audioPath: await archive.keep(audioPath),
        durationSeconds,
        transcript,
        wordsPerMinute: fluency.wordsPerMinute,
        fillers: fluency.fillerCount,
        createdAt: clock().toISOString(),
      });
      await reload();
    },
    [recognizer, talks, archive, clock, reload],
  );
  const recording = useAnswerRecording(onRecorded, TALK_SECONDS);

  const play = useCallback(
    (path: string) => {
      setPlayError(null);
      player.play(path).catch(e => setPlayError(errorMessage(e)));
    },
    [player],
  );

  return {
    model,
    baseline: list[0] ?? null,
    latest: list.length > 1 ? list[list.length - 1] ?? null : null,
    recording,
    play,
    error: recording.error ?? playError,
  };
}
