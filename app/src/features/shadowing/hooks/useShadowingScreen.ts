import { useCallback, useMemo, useState } from 'react';
import { NORMAL_RATE, SLOW_RATE, WORD_RATE } from '../model/constants';
import { sentenceAdvanced } from '../state/slice';
import { useShadowingDispatch } from '../state/hooks';
import { useAssessAttempt } from './useAssessAttempt';
import { useAttemptView } from './useAttemptView';
import { useCurrentSentence } from './useCurrentSentence';
import { useMicPermission } from './useMicPermission';
import { usePlayback } from './usePlayback';
import { useRecordAttempt } from './useRecordAttempt';
import { useSpeechModel } from './useSpeechModel';

/** Wires the shadowing screen: sentence, playback, recording, result and word details. */
export function useShadowingScreen() {
  const dispatch = useShadowingDispatch();
  const current = useCurrentSentence();
  const view = useAttemptView(current.tokens.length);
  const model = useSpeechModel();
  const { request } = useMicPermission();
  const playback = usePlayback();
  const assess = useAssessAttempt(current.tokens, current.hints);
  const isPermitted = useCallback(async () => (await request()) === 'granted', [request]);
  const record = useRecordAttempt({ isPermitted, onRecorded: assess, beforeRecord: playback.stop });
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // usePlayback catches its own errors, so these promises never reject.
  const { speak, modelThenMe } = playback;
  const { audioPath } = view;
  const text = current.sentence;
  const actions = useMemo(
    () => ({
      onPlay: () => {
        speak(text, NORMAL_RATE);
      },
      onPlaySlow: () => {
        speak(text, SLOW_RATE);
      },
      onModelThenMe: () => {
        if (audioPath) modelThenMe(text, audioPath);
      },
    }),
    [speak, modelThenMe, text, audioPath],
  );
  const listenWord = useCallback((word: string) => {
    speak(word, WORD_RATE);
  }, [speak]);
  const closeWord = useCallback(() => setSelectedIndex(null), []);
  const next = useCallback(() => {
    setSelectedIndex(null);
    dispatch(sentenceAdvanced({ sentenceCount: current.total }));
  }, [dispatch, current.total]);
  const { stop: stopRecord } = record;
  const stopRecording = useCallback(() => {
    stopRecord();
  }, [stopRecord]);

  return {
    current,
    statuses: view.statuses,
    summary: view.summary,
    model,
    actions,
    record: { phase: record.phase, start: record.start, stop: stopRecording },
    isBusy: playback.isPlaying || record.phase !== 'idle',
    canCompare: audioPath !== null,
    error: record.error ?? playback.error,
    selectedToken: selectedIndex === null ? null : current.tokens[selectedIndex] ?? null,
    word: { select: setSelectedIndex, close: closeWord, listen: listenWord },
    next,
  };
}
