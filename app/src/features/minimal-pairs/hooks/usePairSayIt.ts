import { useCallback, useEffect, useState } from 'react';
import { useHoldToRecord, useMicPermission, useSpeak } from '@/services/speech';
import { useMinimalPairsDependencies } from '../dependencies/MinimalPairsDependencies';
import { PAIR_WORD_RATE } from '../model/constants';
import type { Round, SayResult } from '../model/types';
import { judgeSaid } from '../services/judgeRound.service';

/** Say-it: record the target word; every try is judged and reported. */
export function usePairSayIt(round: Round, onResult: (correct: boolean) => Promise<void>) {
  const { recorder, recognizer, aliases, tts } = useMinimalPairsDependencies();
  const { isPermitted } = useMicPermission(recorder);
  const speech = useSpeak(tts);
  const [result, setResult] = useState<SayResult | null>(null);

  useEffect(() => setResult(null), [round]);

  const onRecorded = useCallback(
    async (audioPath: string) => {
      const hints = [round.pair.a.word, round.pair.b.word];
      const transcript = await recognizer.transcribe(audioPath, hints);
      const verdict = judgeSaid(round, transcript, aliases);
      setResult({ verdict, transcript });
      await onResult(verdict === 'correct');
    },
    [round, recognizer, aliases, onResult],
  );

  const record = useHoldToRecord({ recorder, isPermitted, onRecorded, beforeRecord: speech.stop });
  const { speak } = speech;
  const word = round.target.word;
  const listen = useCallback(() => {
    speak(word, PAIR_WORD_RATE);
  }, [speak, word]);
  const { stop } = record;
  const stopRecording = useCallback(() => {
    stop();
  }, [stop]);

  return {
    result,
    listen,
    record: { phase: record.phase, start: record.start, stop: stopRecording },
    error: record.error ?? speech.error,
  };
}
