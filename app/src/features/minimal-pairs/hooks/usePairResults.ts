import { useCallback, useState } from 'react';
import { errorMessage } from '@/shared/utils';
import { useMinimalPairsDependencies } from '../dependencies/MinimalPairsDependencies';
import type { PairMode, Round } from '../model/types';

export type PairScore = { correct: number; total: number };

/** Saves every result to pair_attempts and keeps this session's score. Never rejects. */
export function usePairResults(mode: PairMode) {
  const { attempts, clock } = useMinimalPairsDependencies();
  const [score, setScore] = useState<PairScore>({ correct: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);

  const record = useCallback(
    async (round: Round, correct: boolean) => {
      setScore(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }));
      try {
        await attempts.save({
          pairId: round.pair.id,
          sound: round.pair.sound,
          mode,
          correct,
          createdAt: clock().toISOString(),
        });
        setError(null);
      } catch (e) {
        setError(errorMessage(e));
      }
    },
    [attempts, clock, mode],
  );

  return { score, record, error };
}
