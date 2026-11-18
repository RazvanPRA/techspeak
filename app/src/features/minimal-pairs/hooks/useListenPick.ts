import { useCallback, useEffect, useState } from 'react';
import { useSpeak } from '@/services/speech';
import { useMinimalPairsDependencies } from '../dependencies/MinimalPairsDependencies';
import { PAIR_WORD_RATE } from '../model/constants';
import type { PairSide, Round } from '../model/types';
import { isCorrectPick } from '../services/judgeRound.service';

/** Listen-and-pick: speaks the target when the round starts; the first pick counts. */
export function useListenPick(round: Round, onResult: (correct: boolean) => void) {
  const { tts } = useMinimalPairsDependencies();
  const { speak, isSpeaking, error } = useSpeak(tts);
  const [picked, setPicked] = useState<PairSide | null>(null);
  const word = round.target.word;

  const play = useCallback(() => {
    speak(word, PAIR_WORD_RATE);
  }, [speak, word]);

  useEffect(() => {
    setPicked(null);
    play();
  }, [round, play]);

  const pick = useCallback(
    (side: PairSide) => {
      if (picked !== null) return;
      setPicked(side);
      onResult(isCorrectPick(round, side));
    },
    [picked, round, onResult],
  );

  return { picked, play, pick, isSpeaking, error };
}
